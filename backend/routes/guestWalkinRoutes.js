const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth'); // import the middleware

// ADD the middleware here ⬇
router.post('/', authenticateToken, (req, res) => {
  console.log('Received guestWalkin payload:', req.body);

  const guestData = req.body.guest_walkin_data || {};
  const { name, phone, email, id_proof, country, created_at } = guestData;

  //  Get clerk ID from token
  const ownerclerk_id = req.user?.id;

  if (!ownerclerk_id) {
    return res.status(401).json({ error: 'Unauthorized: Clerk not logged in' });
  }

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Missing required guest data' });
  }

  const checkEmailQuery = `SELECT * FROM guest_walkin WHERE email = ?`;

  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const insertQuery = `
      INSERT INTO guest_walkin (name, phone, email, id_proof, country, created_at, ownerclerk_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [name, phone, email, id_proof, country, created_at, ownerclerk_id], (err, result) => {
      if (err) {
        console.error('Error inserting guest walkin:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ guest_walkin_id: result.insertId });
    });
  });
});


module.exports = router;
