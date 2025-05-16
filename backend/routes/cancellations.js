// routes/cancellations.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cancellations with optional filters
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM cancellations';
    const params = [];
    const filters = [];
    
    // Apply filters if provided
    if (req.query.booking_id) {
      filters.push('booking_id = ?');
      params.push(req.query.booking_id);
    }
    
    if (req.query.user_id) {
      filters.push('user_id = ?');
      params.push(req.query.user_id);
    }
    
    if (req.query.start_date) {
      filters.push('cancelled_at >= ?');
      params.push(req.query.start_date);
    }
    
    if (req.query.end_date) {
      filters.push('cancelled_at <= ?');
      params.push(req.query.end_date);
    }
    
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    query += ' ORDER BY cancelled_at DESC';
    
    // Use promise() wrapper
    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;