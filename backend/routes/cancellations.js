// routes/cancellations.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all cancellations with user and room details
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT 
        c.cancellation_id,
        c.booking_id,
        c.user_id,
        u.username,
        u.email,
        r.name AS room_name,
        c.refund_amount,
        c.cancelled_at
      FROM cancellations c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN bookings b ON c.booking_id = b.booking_id
      LEFT JOIN rooms r ON b.room_id = r.room_id
    `;
    
    const params = [];
    const filters = [];
    
    // Apply filters if provided
    if (req.query.booking_id) {
      filters.push('c.booking_id = ?');
      params.push(req.query.booking_id);
    }
    
    if (req.query.user_id) {
      filters.push('c.user_id = ?');
      params.push(req.query.user_id);
    }
    
    if (req.query.username) {
      filters.push('u.username LIKE ?');
      params.push(`%${req.query.username}%`);
    }
    
    if (req.query.email) {
      filters.push('u.email LIKE ?');
      params.push(`%${req.query.email}%`);
    }
    
    if (req.query.room_name) {
      filters.push('r.name LIKE ?');
      params.push(`%${req.query.room_name}%`);
    }
    
    if (req.query.start_date) {
      filters.push('c.cancelled_at >= ?');
      params.push(req.query.start_date);
    }
    
    if (req.query.end_date) {
      filters.push('c.cancelled_at <= ?');
      params.push(req.query.end_date);
    }
    
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    query += ' ORDER BY c.cancelled_at DESC';
    
    const [rows] = await db.promise().query(query, params);
    
    res.json(rows.map(row => ({
      cancellation_id: row.cancellation_id,
      booking_id: row.booking_id,
      user_id: row.user_id,
      username: row.username,
      email: row.email,
      room_name: row.room_name,
      refund_amount: row.refund_amount,
      cancelled_at: row.cancelled_at
    })));
    
  } catch (err) {
    console.error('Cancellation fetch error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching cancellations',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        sql: err.sql
      } : undefined
    });
  }
});

module.exports = router;