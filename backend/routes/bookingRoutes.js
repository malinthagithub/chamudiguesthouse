const express = require("express");
const router = express.Router();
const db = require("../db"); // Import your MySQL connection
router.get('/all-bookings', async (req, res) => {
    try {
        const { filter, search, startDate } = req.query;

        let baseQuery = `
            SELECT 
                b.booking_id,
                r.name AS room_name,
                r.room_id,

                CASE 
                    WHEN b.booking_source = 'online' THEN u.username
                    WHEN b.booking_source = 'walk-in' THEN gw.name
                    ELSE 'Unknown'
                END AS guest_name,

                CASE 
                    WHEN b.booking_source = 'online' THEN u.email
                    WHEN b.booking_source = 'walk-in' THEN gw.email
                    ELSE 'Unknown'
                END AS guest_email,

                b.checkin_date,
                b.checkout_date,
                b.status,
                b.created_at,
                b.booking_source,
                p.amount AS payment_amount,
                p.payment_method,
                p.payment_status
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN guest_walkin gw ON b.guest_walkin_id = gw.guest_walkin_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
        `;

        const whereClauses = [];
        const params = [];

        // Optional: built-in filter (today/week/month)
        if (filter === 'today') {
            whereClauses.push('DATE(b.checkin_date) = CURDATE()');
        } else if (filter === 'week') {
            whereClauses.push('YEARWEEK(b.checkin_date, 1) = YEARWEEK(CURDATE(), 1)');
        } else if (filter === 'month') {
            whereClauses.push('YEAR(b.checkin_date) = YEAR(CURDATE()) AND MONTH(b.checkin_date) = MONTH(CURDATE())');
        }

        // Search filter
        if (search) {
            whereClauses.push(`
                (r.name LIKE ? OR 
                u.username LIKE ? OR 
                u.email LIKE ? OR
                gw.name LIKE ? OR
                gw.email LIKE ? OR
                b.status LIKE ?)
            `);
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Start date filter (optional)
        if (startDate) {
    whereClauses.push('DATE(b.checkin_date) = ?');
    params.push(startDate);
}

        if (whereClauses.length > 0) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        baseQuery += ' ORDER BY b.checkin_date DESC';

        db.query(baseQuery, params, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.json(results);
        });

    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Server error fetching all bookings', error });
    }
});



// Get bookings for a specific user
router.get("/:user_id", async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `
            SELECT 
    b.booking_id, 
    b.room_id, 
    DATE_FORMAT(b.checkin_date, '%Y-%m-%d') AS checkin_date,
    DATE_FORMAT(b.checkout_date, '%Y-%m-%d') AS checkout_date,
    b.total_amount, 
    b.status, 
    b.created_at, 
    r.name AS room_name, 
    u.username AS user_name,
    c.refund_amount
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
JOIN users u ON b.user_id = u.id
LEFT JOIN cancellations c ON b.booking_id = c.booking_id
WHERE b.user_id = ?
ORDER BY b.created_at DESC;

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
                users.username, users.email,users.phone_number, users.country, 
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
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };
  
  router.put('/update-booking-status/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;  // This will get the '90' from the URL
      const { status } = req.body;
  
      // Validate input
      if (!bookingId || isNaN(bookingId)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid booking ID' 
        });
      }
  
      if (!status || !['arrived', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          success: false,
          error: 'Invalid status provided',
          validStatuses: ['arrived', 'confirmed', 'cancelled']
        });
      }
  
      // Update the booking status in the database
      const result = await query(
        `UPDATE bookings SET status = ? WHERE booking_id = ?`,
        [status, bookingId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          error: 'Booking not found' 
        });
      }
  
      res.json({ 
        success: true,
        message: 'Booking status updated successfully',
        bookingId,
        newStatus: status
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ 
        success: false,
        error: 'Database operation failed',
        details: error.message 
      });
    }
  });
  
  
module.exports = router;
