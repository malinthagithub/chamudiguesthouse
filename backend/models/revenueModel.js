const db = require('../db');

class RevenueModel {
    // Get all analytics data
    static getAnalytics() {
        const query = `
            -- Your complete SQL query from the original route
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
            -- Rest of your UNION ALL queries...
            /* Paste your entire SQL query here exactly as in your original code */
        `;
        
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Get data for CSV download
    static getDownloadData() {
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
        
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = RevenueModel;