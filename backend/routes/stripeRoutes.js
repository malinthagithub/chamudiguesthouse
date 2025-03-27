const express = require("express");
const mysql = require("mysql2");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer"); // Import nodemailer
// Enable CORS for all origins
router.use(cors());
// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use any email service provider here
  auth: {
    user: process.env.EMAIL_USER, // Your email address (sender)
    pass: process.env.EMAIL_PASS, // Your email password (or app password)
  },
});

router.post("/book-room", async (req, res) => {
  const {
    user_id,
    room_id,
    checkin_date,
    checkout_date,
    total_amount,
    payment_method_id,
  } = req.body;
  
  console.log("Received data:", req.body);

  try {
    if (!user_id || !room_id || !checkin_date || !checkout_date || !total_amount || !payment_method_id) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_amount * 100,
      currency: "usd",
      payment_method_data: {
        type: 'card',
        card: {
          token: payment_method_id,
        },
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed!" });
    }

    const insertBooking = `INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, total_amount, status, created_at, updated_at)
                           VALUES (?, ?, ?, ?, ?, 'confirmed', NOW(), NOW())`;

    db.query(insertBooking, [user_id, room_id, checkin_date, checkout_date, total_amount], (err, result) => {
      if (err) {
        console.error("Error inserting booking:", err);
        return res.status(500).json({ message: "Booking failed due to database error." });
      }

      const booking_id = result.insertId;

      const insertPayment = `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id, payment_date)
                             VALUES (?, ?, 'pending', 'card', ?, NOW())`;

      db.query(insertPayment, [booking_id, total_amount, paymentIntent.id], (err) => {
        if (err) {
          console.error("Error inserting payment:", err);
          return res.status(500).json({ message: "Payment record failed." });
        }

        // Update payment status after confirmation
        const updatePaymentStatus = `UPDATE payments SET payment_status = 'completed' WHERE transaction_id = ?`;

        db.query(updatePaymentStatus, [paymentIntent.id], (err) => {
          if (err) {
            console.error("Error updating payment status:", err);
            return res.status(500).json({ message: "Payment status update failed." });
          }
          
          // Send confirmation email
          db.query('SELECT email FROM users WHERE id = ?', [user_id], (err, result) => {
            if (err || result.length === 0) {
              console.error("Error fetching user email:", err);
              return res.status(500).json({ message: "Unable to send email." });
            }

            const userEmail = result[0].email;

            const mailOptions = {
              from: process.env.EMAIL_USER, // Sender address
              to: userEmail, // Receiver's email address
              subject: "Booking Confirmation", // Email subject
              text: `Dear user, your booking has been confirmed! 
                     Room ID: ${room_id}
                     Check-in Date: ${checkin_date}
                     Check-out Date: ${checkout_date}
                     Total Amount: $${total_amount}
                     
                     Payment Status: Completed
                     
                     Thank you for booking with us!`, // Email body
            };

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error("Error sending email:", err);
                return res.status(500).json({ message: "Email sending failed." });
              }

              console.log("Email sent:", info.response);
            });
          });

          res.json({ message: "Booking confirmed & payment successful!", booking_id });
        });
      });
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Payment processing failed.",
      error: error.message || error,
    });
  }
});

module.exports = router;
