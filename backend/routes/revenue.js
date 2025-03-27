const express = require('express'); // Import express
const router = express.Router();
const db = require('../db'); // Import your database connection
const { Parser } = require('json2csv');

// Revenue Analysis Route
router.get('/analytics', async (req, res) => {
    const query = `
        -- Monthly Revenue
        SELECT
            'monthly' AS type,
            YEAR(created_at) AS year,
            MONTH(created_at) AS month,
            NULL AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            SUM(total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY YEAR(created_at), MONTH(created_at)

        UNION ALL

        -- Room-wise Revenue
        SELECT 
            'room-wise' AS type,
            YEAR(b.created_at) AS year,
            MONTH(b.created_at) AS month,
            NULL AS day,
            NULL AS week,
            r.room_id,
            r.name AS room_name,
            SUM(b.total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.status = 'confirmed'
        GROUP BY r.room_id, r.name, YEAR(b.created_at), MONTH(b.created_at)

        UNION ALL

        -- Total Revenue
        SELECT 
            'total' AS type,
            NULL AS year,
            NULL AS month,
            NULL AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            SUM(total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings
        WHERE status = 'confirmed'

        UNION ALL

        -- Yearly Revenue
        SELECT 
            'yearly' AS type,
            YEAR(created_at) AS year,
            NULL AS month,
            NULL AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            SUM(total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY YEAR(created_at)

        UNION ALL

        -- Daily Revenue
        SELECT 
            'daily' AS type,
            YEAR(created_at) AS year,
            MONTH(created_at) AS month,
            DAY(created_at) AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            SUM(total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY YEAR(created_at), MONTH(created_at), DAY(created_at)

        UNION ALL

        -- Weekly Revenue
        SELECT
            'weekly' AS type,
            YEAR(created_at) AS year,
            MONTH(created_at) AS month,
            NULL AS day,
            WEEK(created_at) AS week,
            NULL AS room_id,
            NULL AS room_name,
            SUM(total_amount) AS revenue,
            NULL AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY YEAR(created_at), MONTH(created_at), WEEK(created_at)

        UNION ALL

        -- Current Guest Count (Active Guests) - Count by user_id
        SELECT
            'current_guest_count' AS type,
            NULL AS year,
            NULL AS month,
            NULL AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            NULL AS revenue,
            COUNT(DISTINCT b.user_id) AS guest_count
        FROM bookings b
        WHERE b.status = 'confirmed' AND CURDATE() BETWEEN b.checkin_date AND b.checkout_date

        UNION ALL

        -- Monthly Guest Count (Bookings by each user per month)
        SELECT
            'monthly_guest_count' AS type,
            YEAR(created_at) AS year,
            MONTH(created_at) AS month,
            NULL AS day,
            NULL AS week,
            NULL AS room_id,
            NULL AS room_name,
            NULL AS revenue,
            COUNT(DISTINCT user_id) AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        GROUP BY YEAR(created_at), MONTH(created_at)

        UNION ALL

        -- Weekly Guest Count (Bookings by each user per week)
        SELECT
            'weekly_guest_count' AS type,
            YEAR(CURDATE()) AS year,
            MONTH(CURDATE()) AS month,
            NULL AS day,
            WEEK(CURDATE()) AS week,
            NULL AS room_id,
            NULL AS room_name,
            NULL AS revenue,
            COUNT(DISTINCT user_id) AS guest_count
        FROM bookings
        WHERE status = 'confirmed'
        AND CURDATE() BETWEEN checkin_date AND checkout_date
        GROUP BY YEAR(CURDATE()), MONTH(CURDATE()), WEEK(CURDATE())

        ORDER BY year, month, week, day;
    `;

    try {
        db.query(query, (err, rows) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ error: 'Failed to retrieve revenue analytics' });
            }
            res.json(rows);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New Download Analytics Route
router.get('/analytics/download', async (req, res) => {
    const query = `
        SELECT 
            YEAR(b.created_at) AS year,
            MONTH(b.created_at) AS month,
            DAY(b.created_at) AS day,
            b.room_id,
            r.name AS room_name,
            COUNT(b.booking_id) AS total_bookings,
            SUM(b.total_amount) AS total_revenue,
            COUNT(DISTINCT b.user_id) AS unique_guests,
            SUM(p.amount) AS total_payments,
            COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) AS successful_payments,
            COUNT(CASE WHEN p.payment_status = 'failed' THEN 1 END) AS failed_payments
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN payment p ON b.booking_id = p.booking_id
        WHERE b.status = 'confirmed'
        GROUP BY YEAR(b.created_at), MONTH(b.created_at), DAY(b.created_at), b.room_id, r.name
        ORDER BY year DESC, month DESC, day DESC;
    `;

    try {
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
