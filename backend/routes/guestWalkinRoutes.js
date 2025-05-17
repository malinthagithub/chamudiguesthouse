const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { name, phone, email, id_proof, country, created_at } = req.body;

  // First, check if email already exists
  const checkEmailQuery = `SELECT * FROM guest_walkin WHERE email = ?`;

  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Email already exists
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Email not found, proceed to insert
    const insertQuery = `
      INSERT INTO guest_walkin (name, phone, email, id_proof, country, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, phone, email, id_proof, country, created_at], (err, result) => {
      if (err) {
        console.error('Error inserting guest walkin:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ guest_walkin_id: result.insertId });
    });
  });
});


module.exports = router;
