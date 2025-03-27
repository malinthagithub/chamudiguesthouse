const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the connection

// Query to get all rooms with their names, comments, and average ratings
router.get('/reviews', (req, res) => {
  const query = `
    SELECT 
      r.room_id, 
      r.name AS room_name, 
      GROUP_CONCAT(rv.comment) AS comments, 
      AVG(rv.rating) AS average_rating
    FROM reviews rv
    JOIN rooms r ON rv.room_id = r.room_id
    GROUP BY r.room_id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching room reviews' });
    }

    if (results.length > 0) {
      return res.json(results);  // Return the data for all rooms
    } else {
      return res.status(404).json({ message: 'No rooms found or no reviews available' });
    }
  });
});

module.exports = router;
