const express = require("express");
const router = express.Router();
const db = require("../db"); // Import your MySQL connection

// Bookings for today and this week route
router.get('/today-and-week-bookings', async (req, res) => {
    const today = new Date(); // Get today's date
    const localDate = today.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format (local timezone)

    // Query to get today's bookings (now comparing only the date part)
    const todayQuery = `
       SELECT
    b.booking_id,
    r.name AS room_name,
    COALESCE(u.username, gw.name) AS username,  -- Keep key as 'username' for frontend compatibility
    b.checkin_date,
    b.checkout_date,
    b.total_amount AS payment_amount,
    b.status
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN guest_walkin gw ON b.guest_walkin_id = gw.guest_walkin_id
WHERE b.status IN ('confirmed', 'arrived')
  AND DATE(b.checkin_date) = ?;


    `;

    // Query to get this week's bookings
    const weekQuery = `
        SELECT
    b.booking_id,
    r.name AS room_name,
    COALESCE(u.username, gw.name) AS username,
    b.checkin_date,
    b.checkout_date,
    b.total_amount AS payment_amount,
    b.status
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN guest_walkin gw ON b.guest_walkin_id = gw.guest_walkin_id
WHERE b.status IN ('confirmed', 'arrived')
  AND YEARWEEK(b.checkin_date, 1) = YEARWEEK(CURDATE(), 1);

    `;

    try {
        // Execute both queries in parallel using Promise.all
        const [todayBookings, weekBookings] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(todayQuery, [localDate], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            }),
            new Promise((resolve, reject) => {
                db.query(weekQuery, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            })
        ]);

        // Send both sets of data as separate responses
        res.json({
            todayBookings: todayBookings,
            weekBookings: weekBookings,
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bookings for a specific room
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

        // Execute the query
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
