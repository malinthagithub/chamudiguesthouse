const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure you have a working db connection

// Debugging route
router.get('/', (req, res) => {
    console.log("Received request at /api/search");  // Debugging line

    // Extract query parameters
    let { room_type, min_price, max_price, min_rating, max_rating, features, payment_status } = req.query;

    // Start building SQL query
    let sql = "SELECT * FROM rooms WHERE 1=1";
    let params = [];

    // Filter by room_type
    if (room_type) {
        sql += " AND room_type = ?";
        params.push(room_type.trim());
    }

    // Filter by rentperday (price range)
    if (min_price && max_price) {
        sql += " AND rentperday BETWEEN ? AND ?";
        params.push(parseFloat(min_price), parseFloat(max_price));
    } else {
        if (min_price) {
            sql += " AND rentperday >= ?";
            params.push(parseFloat(min_price));
        } else if (max_price) {
            sql += " AND rentperday <= ?";
            params.push(parseFloat(max_price));
        }
    }

    // Filter by rating
    if (min_rating && max_rating) {
        sql += " AND rating BETWEEN ? AND ?";
        params.push(parseFloat(min_rating), parseFloat(max_rating));
    } else {
        if (min_rating) {
            sql += " AND rating >= ?";
            params.push(parseFloat(min_rating));
        } else if (max_rating) {
            sql += " AND rating <= ?";
            params.push(parseFloat(max_rating));
        }
    }

    // Filter by features (like Wi-Fi)
    if (features) {
        sql += " AND features LIKE ?";
        params.push(`%${features.trim()}%`);
    }

    // Filter by payment_status
    if (payment_status) {
        sql += " AND payment_status = ?";
        params.push(payment_status.trim());
    }

    console.log("Executing SQL:", sql, "Params:", params);  // Debugging line

    // Execute SQL query
    db.execute(sql, params, (err, results) => {
        if (err) {
            console.error("SQL Error:", err);  // Debugging line
            return res.status(500).json({ message: 'Database error', error: err });
        }

        console.log("Results:", results);  // Debugging line
        res.json(results);  // Send results as JSON response
    });
});

module.exports = router;
