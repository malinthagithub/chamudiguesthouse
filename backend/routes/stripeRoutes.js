const express = require("express");
const mysql = require("mysql2");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const nodemailer = require("nodemailer");

const router = express.Router();
const db = require("../db");

router.use(cors());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route: POST /api/book-room
router.post("/book-room", async (req, res) => {
  let {
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

    // Get current loyalty points
    const [userData] = await db.promise().query(
      `SELECT loyalty_points FROM users WHERE id = ?`,
      [user_id]
    );

    let currentPoints = userData[0].loyalty_points;
    let discount = 0;
    let usedPoints = false;

    // Apply 20% discount if eligible
    if (currentPoints >= 100) {
      discount = total_amount * 0.2;
      total_amount = total_amount - discount;
      usedPoints = true;
    }

    // Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_amount,
      currency: "usd",
      payment_method_data: {
        type: "card",
        card: {
          token: payment_method_id,
        },
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed!" });
    }

    // Insert booking
    const insertBooking = `
      INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, total_amount, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'confirmed', NOW(), NOW())
    `;

    db.query(
      insertBooking,
      [user_id, room_id, checkin_date, checkout_date, total_amount],
      (err, result) => {
        if (err) {
          console.error("Error inserting booking:", err);
          return res.status(500).json({ message: "Booking failed." });
        }

        const booking_id = result.insertId;

        // Insert payment record
        const insertPayment = `
          INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id, payment_date)
          VALUES (?, ?, 'pending', 'card', ?, NOW())
        `;

        db.query(insertPayment, [booking_id, total_amount, paymentIntent.id], (err) => {
          if (err) {
            console.error("Error inserting payment:", err);
            return res.status(500).json({ message: "Payment record failed." });
          }

          // Mark payment completed
          db.query(
            `UPDATE payments SET payment_status = 'completed' WHERE transaction_id = ?`,
            [paymentIntent.id],
            (err) => {
              if (err) {
                console.error("Error updating payment status:", err);
                return res.status(500).json({ message: "Failed to update payment status." });
              }

              // Calculate new loyalty points
              let newPoints;
              if (usedPoints) {
                newPoints = 10;
              } else {
                newPoints = Math.min(currentPoints + 10, 100);
              }

              // Update user loyalty points
              db.query(
                `UPDATE users SET loyalty_points = ? WHERE id = ?`,
                [newPoints, user_id],
                (err) => {
                  if (err) {
                    console.error("Error updating loyalty points:", err);
                    return res.status(500).json({ message: "Failed to update loyalty points." });
                  }

                  // Get user email
                  db.query(`SELECT email FROM users WHERE id = ?`, [user_id], (err, result) => {
                    if (err || result.length === 0) {
                      console.error("Error fetching email:", err);
                      return res.status(500).json({ message: "Email fetch failed." });
                    }

                    const userEmail = result[0].email;

                    // Email options
                    const mailOptions = {
                      from: process.env.EMAIL_USER,
                      to: userEmail,
                      subject: "Booking Confirmation",
                      text: `Dear user, your booking has been confirmed!

Room ID: ${room_id}
Check-in Date: ${checkin_date}
Check-out Date: ${checkout_date}
Total Amount: $${total_amount.toFixed(2)}
Discount Applied: $${discount.toFixed(2)}

Payment Status: Completed

Loyalty Points Earned: 10
Total Loyalty Points: ${newPoints}

Thank you for booking with us!`,
                    };

                    // Send email
                    transporter.sendMail(mailOptions, (err, info) => {
                      if (err) {
                        console.error("Email sending failed:", err);
                        return res.status(500).json({ message: "Failed to send email." });
                      }

                      console.log("Email sent:", info.response);

                      // ✅ Success response
                      res.json({
                        message: "Booking confirmed & payment successful!",
                        booking_id,
                        discount,
                        total_amount,
                        loyaltyPoints: newPoints,
                      });
                    });
                  });
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Error during booking:", error);
    res.status(500).json({
      message: "Payment or booking failed.",
      error: error.message || error,
    });
  }
});

module.exports = router;
