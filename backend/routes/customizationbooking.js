// routes/customizationbooking.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL2 pool

router.get('/room-customizations', async (req, res) => {
  try {
    let whereClause = `b.status = 'confirmed'`;
    const params = [];

    if (req.query.filter === 'today') {
      whereClause += ` AND DATE(b.checkin_date) = CURDATE()`;
    } else if (req.query.filter === 'this_week') {
      whereClause += ` AND YEARWEEK(b.checkin_date, 1) = YEARWEEK(CURDATE(), 1)`;
    } else if (req.query.filter === 'this_month') {
      whereClause += ` AND MONTH(b.checkin_date) = MONTH(CURDATE()) AND YEAR(b.checkin_date) = YEAR(CURDATE())`;
    }

    const query = `
      SELECT
        b.booking_id,
        b.user_id,
        u.username AS guest_name,
        b.room_id,
        r.name AS room_name,
        b.checkin_date,
        b.checkout_date,
        b.total_amount,
        b.status,
        c.beds,
        c.hot_water,
        c.wifi,
        c.ac,
        c.minibar,
        c.room_service,
        c.breakfast,
        c.pool_access,
        c.view,
        c.total_price AS customization_price
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.room_id
      JOIN customizations c ON b.user_id = c.user_id AND b.room_id = c.room_id
      WHERE ${whereClause}
      ORDER BY b.checkin_date ASC
    `;

    const [results] = await db.promise().query(query, params);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

module.exports = router;
