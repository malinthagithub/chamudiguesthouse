const express = require("express");
const router = express.Router();
const db = require("../db"); // Import your MySQL connection

// Get bookings for a specific user
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `
            SELECT b.booking_id, b.room_id, 
                   DATE_FORMAT(b.checkin_date, '%Y-%m-%d') AS checkin_date,
                   DATE_FORMAT(b.checkout_date, '%Y-%m-%d') AS checkout_date,
                   b.total_amount, b.status, b.created_at, 
                   r.name AS room_name, 
                   u.username AS user_name
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN users u ON b.user_id = u.id  -- Correct column name 'id' in 'users' table
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;

        db.query(query, [user_id], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            // Check if results are an array and return data
            if (Array.isArray(results) && results.length > 0) {
                res.json(results);
            } else {
                res.status(404).json({ message: "No bookings found for this user." });
            }
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// Get bookings for a specific room
router.get('/room/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {
        const query = `
            SELECT 
                bookings.booking_id, bookings.checkin_date, bookings.checkout_date, bookings.status, bookings.created_at,
                users.username, users.email, 
                payments.amount, payments.payment_method, payments.payment_status
            FROM bookings
            JOIN users ON bookings.user_id = users.id
            JOIN payments ON bookings.booking_id = payments.booking_id  -- Corrected join condition
            WHERE bookings.room_id = ?
        `;

        db.query(query, [roomId], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            // Check if results are an array and return data
            if (Array.isArray(results) && results.length > 0) {
                res.json(results);
            } else {
                res.status(404).json({ message: 'No bookings found for this room.' });
            }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error fetching bookings', error });
    }
});

module.exports = router;
