const express = require('express'); // Import express
const router = express.Router();
const db = require('../db'); // Import your database connection
const { Parser } = require('json2csv'); // Import the json2csv parser

// New Download Analytics Route (Separate File for Report Download)
router.get('/download', async (req, res) => {
    const query = `
        SELECT 
            YEAR(b.created_at) AS year,
            MONTH(b.created_at) AS month,
            DAY(b.created_at) AS day,
            b.room_id,
            r.name AS room_name,
            COUNT(b.booking_id) AS total_bookings,  -- Updated booking_id
            SUM(b.total_amount) AS total_revenue,
            COUNT(DISTINCT b.user_id) AS unique_guests,
            SUM(p.amount) AS total_payments,
            COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) AS successful_payments,
            COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) AS failed_payments
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id  -- Updated booking_id
        WHERE b.status = 'confirmed'
        GROUP BY YEAR(b.created_at), MONTH(b.created_at), DAY(b.created_at), b.room_id, r.name
        ORDER BY year DESC, month DESC, day DESC;
    `;

    try {
        // Query the database
        db.query(query, (err, rows) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'Failed to generate report' });
            }

            // Convert JSON to CSV
            const json2csvParser = new Parser();
            const csv = json2csvParser.parse(rows);

            // Set headers for CSV download
            res.header('Content-Type', 'text/csv');
            res.attachment('revenue_report.csv');
            res.send(csv);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
