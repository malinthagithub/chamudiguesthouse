require('dotenv').config(); // Load .env before anything else

const express = require('express');
const router = express.Router();
const db = require('../db'); // your mysql2 connection
const util = require('util');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const query = util.promisify(db.query).bind(db);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,    // your gmail address
    pass: process.env.EMAIL_PASS,    // your gmail app password
  },
});

// Email sending helper
async function sendBookingEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

// Calculate total days
function calculateDays(checkin, checkout) {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
  const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return days;
}

// Check room availability
async function isRoomAvailable(roomId, checkin, checkout) {
  const overlappingBookings = await query(
    `SELECT * FROM bookings 
     WHERE room_id = ? 
       AND status != 'Cancelled'
       AND NOT (checkout_date <= ? OR checkin_date >= ?)`,
    [roomId, checkin, checkout]
  );
  return overlappingBookings.length === 0;
}

// Walk-in payment and booking confirmation
router.post('/api/walkin-payment', async (req, res) => {
  try {
    const { roomId, checkin, checkout, user_id, guest_walkin_id, payment_method, payment_intent_id } = req.body;

    if (!roomId || !checkin || !checkout || !payment_method || (!user_id && !guest_walkin_id)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const available = await isRoomAvailable(roomId, checkin, checkout);
    if (!available) {
      return res.status(400).json({ success: false, message: 'Room already booked for selected dates' });
    }

    const roomRows = await query('SELECT rentperday FROM rooms WHERE room_id = ?', [roomId]);
    if (roomRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const rentPerDay = parseFloat(roomRows[0].rentperday);
    const days = calculateDays(checkin, checkout);

    if (days <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    const totalAmount = rentPerDay * days;

    // ✅ Determine booking status based on checkin date
    const today = new Date().toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
    const bookingStatus = checkin === today ? 'Arrived' : 'Confirmed';

    // ✅ Insert booking
    const bookingFields = ['room_id', 'checkin_date', 'checkout_date', 'total_amount', 'status', 'booking_source'];
    const bookingValues = [roomId, checkin, checkout, totalAmount, bookingStatus, user_id ? 'online' : 'walk-in'];

    if (user_id) {
      bookingFields.push('user_id');
      bookingValues.push(user_id);
    } else {
      bookingFields.push('guest_walkin_id');
      bookingValues.push(guest_walkin_id);
    }

    const placeholders = bookingFields.map(() => '?').join(', ');
    const insertBookingQuery = `INSERT INTO bookings (${bookingFields.join(', ')}) VALUES (${placeholders})`;
    const bookingResult = await query(insertBookingQuery, bookingValues);
    const booking_id = bookingResult.insertId;

    // ✅ Insert payment
    await query(
      `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id, payment_date)
       VALUES (?, ?, 'completed', ?, ?, NOW())`,
      [booking_id, totalAmount, payment_method, payment_intent_id || null]
    );

    // ✅ Optional email if walk-in guest
    if (guest_walkin_id) {
      const guestResult = await query('SELECT email, name FROM guest_walkin WHERE guest_walkin_id = ?', [guest_walkin_id]);

      if (guestResult.length > 0) {
        const guestEmail = guestResult[0].email;
        const guestName = guestResult[0].name;

        const subject = 'Hotel Booking Confirmation';
        const emailText = `Hello ${guestName},\n\nYour booking from ${checkin} to ${checkout} has been confirmed.\nTotal amount: $${totalAmount.toFixed(2)}\n\nThank you for choosing us!`;

        try {
          await sendBookingEmail(guestEmail, subject, emailText);
        } catch (emailErr) {
          console.error('Email send error:', emailErr);
        }
      }
    }

    res.json({
      success: true,
      message: 'Booking and payment recorded successfully',
      booking_id,
    });
  } catch (error) {
    console.error('Walk-in payment error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment processing' });
  }
});


// Get all walk-in bookings with guest_walkin data
router.get('/walkin-bookings', (req, res) => {
  const { date, booking_id } = req.query;

  // Updated SQL to include payment information and use correct date column
  let sql = `
    SELECT 
      b.*, 
      g.name, 
      g.phone, 
      g.email, 
      g.country,
      p.payment_method,
      p.amount,
      p.payment_status,
      p.payment_date
    FROM bookings b
    JOIN guest_walkin g ON b.guest_walkin_id = g.guest_walkin_id
    LEFT JOIN payments p ON b.booking_id = p.booking_id
    WHERE b.booking_source = 'walk-in'
  `;

  const params = [];

  // Filter by date if provided
  if (date) {
    sql += ' AND DATE(b.checkin_date) = ?';
    params.push(date);
  }

  // Filter by booking_id if provided
  if (booking_id) {
    sql += ' AND b.booking_id = ?';
    params.push(booking_id);
  }

  // Order by checkin_date (or created_at if you have that column)
  sql += ' ORDER BY b.checkin_date DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching walk-in bookings:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Group payments by booking
    const bookingsMap = new Map();
    
    results.forEach(row => {
      if (!bookingsMap.has(row.booking_id)) {
        bookingsMap.set(row.booking_id, {
          booking_id: row.booking_id,
          room_id: row.room_id,
          checkin_date: row.checkin_date,
          checkout_date: row.checkout_date,
          total_amount: row.total_amount,
          status: row.status,
          booking_source: row.booking_source,
          guest_walkin_id: row.guest_walkin_id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          country: row.country,
          payments: []
        });
      }
      
      if (row.payment_method) {
        bookingsMap.get(row.booking_id).payments.push({
          payment_method: row.payment_method,
          amount: row.amount,
          status: row.payment_status,
          date: row.payment_date
        });
      }
    });

    const formattedResults = Array.from(bookingsMap.values());

    res.json(formattedResults);
  });
});
router.post('/api/walkin-create-payment-intent', async (req, res) => {
  const { roomId, checkin, checkout } = req.body;

  const roomRows = await query('SELECT rentperday FROM rooms WHERE room_id = ?', [roomId]);
  if (roomRows.length === 0) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const rentPerDay = parseFloat(roomRows[0].rentperday);
  const days = calculateDays(checkin, checkout);
  const amount = rentPerDay * days * 100; // convert to cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  res.send({ clientSecret: paymentIntent.client_secret });
});

module.exports = router;
