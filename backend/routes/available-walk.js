const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const { checkin, checkout } = req.query;

    if (!checkin || !checkout) {
        return res.status(400).json({ message: "Please provide check-in and check-out dates" });
    }

    const query = `
        SELECT * FROM rooms r
        WHERE r.room_id NOT IN (
            SELECT b.room_id FROM bookings b
            WHERE (
                (b.checkin_date < ? AND b.checkout_date > ?) OR
                (b.checkin_date >= ? AND b.checkin_date < ?) OR
                (b.checkout_date > ? AND b.checkout_date <= ?)
            )
        )
    `;

    db.query(
        query,
        [checkout, checkin, checkin, checkout, checkin, checkout],
        (err, results) => {
            if (err) {
                console.error('Error fetching available rooms:', err);
                return res.status(500).json({ message: 'Error fetching available rooms' });
            }
            res.status(200).json(results);
        }
    );
});

module.exports = router;
