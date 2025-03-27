const express = require("express");
const mysql = require("mysql2");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const nodemailer = require("nodemailer");

const router = express.Router();
const db = require("../db");

router.use(cors());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Function to send email
const sendRefundEmail = async (email, bookingId, refundAmount) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Cancellation and Refund Confirmation",
      html: `
        <h2>Booking Cancellation Confirmation</h2>
        <p>Your booking (ID: <strong>${bookingId}</strong>) has been successfully cancelled.</p>
        <p>Refund Amount: <strong>$${refundAmount}</strong></p>
        <p>Thank you for choosing our service. We hope to see you again!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Refund email sent successfully.");
  } catch (error) {
    console.error("Error sending refund email:", error);
  }
};
// Function to record cancellation in cancellations table
const recordCancellation = (booking_id, user_id, refundAmount) => {
  const insertCancellation = `
    INSERT INTO cancellations (booking_id, user_id, refund_amount)
    VALUES (?, ?, ? )
  `;
  db.query(insertCancellation, [booking_id, user_id, refundAmount,], (err) => {
    if (err) {
      console.error("Error inserting cancellation record:", err);
    } else {
      console.log("Cancellation record inserted successfully.");
    }
  });
};

router.post("/cancel-booking", async (req, res) => {
  const { user_id, booking_id } = req.body;

  console.log("Received cancellation request:", req.body);

  try {
    if (!user_id || !booking_id) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetch the booking details
    const getBooking = `SELECT * FROM bookings WHERE booking_id = ? AND user_id = ? AND status = 'confirmed'`;
    db.query(getBooking, [booking_id, user_id], async (err, results) => {
      if (err) {
        console.error("Error fetching booking:", err);
        return res.status(500).json({ message: "Database error while fetching booking." });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No confirmed booking found for this user." });
      }

      const booking = results[0];

      // Get user email from users table
      const getUserEmail = `SELECT email FROM users WHERE id = ?`;
      db.query(getUserEmail, [user_id], async (err, userResults) => {
        if (err || userResults.length === 0) {
          console.error("Error fetching user email:", err);
          return res.status(500).json({ message: "Error fetching user email." });
        }

        const userEmail = userResults[0].email;

        // Get payment details
        const getPayment = `SELECT * FROM payments WHERE booking_id = ? AND payment_status = 'completed'`;
        db.query(getPayment, [booking_id], async (err, paymentResults) => {
          if (err) {
            console.error("Error fetching payment details:", err);
            return res.status(500).json({ message: "Database error while fetching payment details." });
          }

          if (paymentResults.length === 0) {
            return res.status(404).json({ message: "No successful payment found for this booking." });
          }

          const payment = paymentResults[0];

          // Calculate refund based on payment date
          const paymentDate = new Date(payment.payment_date);
          const today = new Date();
          const timeDiff = (today - paymentDate) / (1000 * 60 * 60 * 24);

          let refundAmount = 0;
          if (3 < timeDiff && timeDiff <= 7) {
            refundAmount = payment.amount;
          } else if (timeDiff <= 3) {
            refundAmount = payment.amount * 0.5;
          } else {
            refundAmount = 0;
          }

          if (refundAmount > 0) {
            try {
              const refund = await stripe.refunds.create({
                payment_intent: payment.transaction_id,
                amount: refundAmount * 100,
              });

              if (!refund || refund.status !== "succeeded") {
                return res.status(500).json({ message: "Refund processing failed." });
              }

              // Update booking status to 'cancelled'
              const updateBooking = `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE booking_id = ?`;
              db.query(updateBooking, [booking_id], (err) => {
                if (err) {
                  console.error("Error updating booking status:", err);
                  return res.status(500).json({ message: "Failed to update booking status." });
                }
// Record cancellation
recordCancellation(booking_id, user_id, refundAmount);
                // Insert refund record in payments table
                const insertRefund = `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id, payment_date)
                                      VALUES (?, ?, 'refunded', 'card', ?, NOW())`;

                db.query(insertRefund, [booking_id, refundAmount, refund.id], async (err) => {
                  if (err) {
                    console.error("Error inserting refund record:", err);
                    return res.status(500).json({ message: "Failed to record refund." });
                  }

                  // Send refund confirmation email
                  await sendRefundEmail(userEmail, booking_id, refundAmount);

                  res.json({
                    message: `Booking cancelled. Refund issued: $${refundAmount}`,
                    refundAmount,
                  });
                });
              });
            } catch (refundError) {
              console.error("Refund error:", refundError);
              return res.status(500).json({
                message: "Refund processing failed.",
                error: refundError.message || refundError,
              });
            }
          } else {
            const updateBooking = `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE booking_id = ?`;
            db.query(updateBooking, [booking_id], async (err) => {
              if (err) {
                console.error("Error updating booking status:", err);
                return res.status(500).json({ message: "Failed to update booking status." });
              }

              // Send cancellation confirmation email without refund
              await sendRefundEmail(userEmail, booking_id, refundAmount);

              res.json({
                message: "Booking cancelled. No refund issued as per policy.",
                refundAmount: 0,
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({ message: "Cancellation processing failed.", error: error.message || error });
  }
});

module.exports = router;
