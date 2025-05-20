const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post('/customize', async (req, res) => {
    const { 
        user_id, room_id, beds, hot_water, wifi, ac, minibar, room_service, 
        breakfast, pool_access, view, payment_method_id, checkin_date, checkout_date, total_price 
    } = req.body;

    // Validate input dates and price
    if (!checkin_date || !checkout_date) {
        return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    if (isNaN(total_price) || total_price <= 0) {
        return res.status(400).json({ message: 'Invalid total price' });
    }

    // Step 1: Check room availability first
    const checkAvailabilityQuery = `
        SELECT * FROM bookings 
        WHERE room_id = ? 
        AND status NOT IN ('cancelled', 'pending')
        AND (
            (checkin_date <= ? AND checkout_date > ?) OR
            (checkin_date < ? AND checkout_date >= ?) OR
            (checkin_date >= ? AND checkout_date <= ?)
        )
    `;

    db.query(checkAvailabilityQuery, [
        room_id, checkin_date, checkout_date,
        checkin_date, checkout_date,
        checkin_date, checkout_date
    ], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error checking availability' });
        if (results.length > 0) return res.status(400).json({ message: 'Room is already booked' });

        // Step 2: Process Stripe payment first
        stripe.paymentIntents.create({
            amount: Math.round(total_price * 100),
            currency: 'usd',
            payment_method: payment_method_id,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never',
            },
        }).then(paymentIntent => {
            // Payment succeeded, now insert booking and customization

            // Insert booking first
            const insertBookingQuery = `
                INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status, total_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(insertBookingQuery, [user_id, room_id, checkin_date, checkout_date, 'confirmed', total_price], (bookingErr, bookingResult) => {
                if (bookingErr) {
                    console.error(bookingErr);
                    return res.status(500).json({ message: 'Error saving booking after payment' });
                }

                const bookingId = bookingResult.insertId;

                // Insert customization linked to bookingId
                const insertCustomizationQuery = `
                    INSERT INTO customizations (user_id, room_id, beds, hot_water, wifi, ac, minibar, 
                        room_service, breakfast, pool_access, view, total_price, booking_id, booking_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                db.query(insertCustomizationQuery, [
                    user_id, room_id, beds, hot_water, wifi, ac, minibar,
                    room_service, breakfast, pool_access, view, total_price, bookingId, 'confirmed'
                ], (custErr, customizationResult) => {
                    if (custErr) {
                        console.error(custErr);
                        return res.status(500).json({ message: 'Error saving customization after payment' });
                    }

                    const customizationId = customizationResult.insertId;

                    // Insert payment record
                    const insertPaymentQuery = `
                        INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id)
                        VALUES (?, ?, ?, ?, ?)
                    `;
                    db.query(insertPaymentQuery, [bookingId, total_price, 'completed', 'stripe', paymentIntent.id], (paymentErr) => {
                        if (paymentErr) {
                            console.error(paymentErr);
                            return res.status(500).json({ message: 'Error saving payment record' });
                        }

                        // All done
                        return res.status(200).json({
                            message: 'Payment, booking and customization successful',
                            bookingId,
                            customizationId,
                            final_price: total_price
                        });
                    });
                });
            });
        }).catch(err => {
            console.error('Payment failed:', err);
            return res.status(400).json({ message: 'Payment failed', error: err });
        });
    });
});

// GET /api/rooms/customizable - get only customizable rooms
router.get('/customizable', async (req, res) => {
  try {
    const query = 'SELECT * FROM rooms WHERE customizable = TRUE';
    const [rooms] = await db.promise().query(query);
    res.json(rooms);
  } catch (err) {
    console.error('Error fetching customizable rooms:', err);
    res.status(500).json({ error: 'Failed to fetch customizable rooms' });
  }
});




module.exports = router;
