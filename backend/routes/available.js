const express = require('express');
const router = express.Router();
const db = require('../db');

const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

router.get('/isAvailable', async (req, res) => {
  let { room_id, checkInDate, checkOutDate } = req.query;

  if (!room_id || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Format the dates
  checkInDate = formatDate(checkInDate);
  checkOutDate = formatDate(checkOutDate);

  try {
    const query = `
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status != 'cancelled'
      AND (
        (checkin_date <= ? AND checkout_date > ?) OR
        (checkin_date < ? AND checkout_date >= ?) OR
        (checkin_date >= ? AND checkout_date <= ?)
      )
    `;

    const [rows] = await db.promise().execute(query, [
      room_id,
      checkInDate, checkInDate,   // condition 1
      checkOutDate, checkOutDate, // condition 2
      checkInDate, checkOutDate   // condition 3
    ]);

    res.setHeader('Content-Type', 'application/json');

    if (rows.length > 0) {
      return res.json({ isAvailable: false });
    }

    res.json({ isAvailable: true });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
