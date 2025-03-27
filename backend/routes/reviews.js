const express = require('express');
const router = express.Router();
const db = require('../db'); // Import database connection

// ✅ POST: Add a new review
router.post('/add', (req, res) => {
  const { id, room_id, rating, comment } = req.body;

  if (!id || !room_id || !rating) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO reviews (id, room_id, rating, comment) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, room_id, rating, comment], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Review added successfully' });
  });
});

// ✅ GET: Fetch reviews for a specific room
router.get('/:room_id', (req, res) => {
  const { room_id } = req.params;
  const { sortBy = 'relevant' } = req.query;

  let orderByClause = 'ORDER BY r.created_at DESC';
  switch (sortBy) {
    case 'newest':
      orderByClause = 'ORDER BY r.created_at DESC';
      break;
    case 'highest':
      orderByClause = 'ORDER BY r.rating DESC';
      break;
    case 'lowest':
      orderByClause = 'ORDER BY r.rating ASC';
      break;
  }

  const sql = `
    SELECT r.review_id, r.rating, r.comment, r.created_at, u.username, u.email, 
           TIMESTAMPDIFF(DAY, r.created_at, NOW()) AS days_ago
    FROM reviews r
    JOIN users u ON r.id = u.id
    WHERE r.room_id = ? ${orderByClause}
  `;

  db.query(sql, [room_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formattedResults = results.map((review) => ({
      review_id: review.review_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      username: review.username,
      email: review.email,
      time_ago: review.days_ago === 0 ? 'Today' : review.days_ago === 1 ? 'Yesterday' : `${review.days_ago} days ago`,
    }));

    res.status(200).json(formattedResults);
  });
});

// ✅ GET: Fetch all reviews given by a specific user
router.get('/user/:id', (req, res) => {
  const { id } = req.params;
  const { sortBy = 'relevant' } = req.query;

  let orderByClause = 'ORDER BY r.created_at DESC';
  switch (sortBy) {
    case 'newest':
      orderByClause = 'ORDER BY r.created_at DESC';
      break;
    case 'highest':
      orderByClause = 'ORDER BY r.rating DESC';
      break;
    case 'lowest':
      orderByClause = 'ORDER BY r.rating ASC';
      break;
  }

  const sql = `
    SELECT r.review_id, r.rating, r.comment, r.created_at, u.username, u.email, 
           TIMESTAMPDIFF(DAY, r.created_at, NOW()) AS days_ago
    FROM reviews r
    JOIN users u ON r.id = u.id
    WHERE r.id = ? ${orderByClause}
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formattedResults = results.map((review) => ({
      review_id: review.review_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      username: review.username,
      email: review.email,
      time_ago: review.days_ago === 0 ? 'Today' : review.days_ago === 1 ? 'Yesterday' : `${review.days_ago} days ago`,
    }));

    res.status(200).json(formattedResults);
  });
});

module.exports = router;
