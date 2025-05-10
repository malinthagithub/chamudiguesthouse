const express = require('express');
const router = express.Router();
const db = require('../db'); // your MySQL connection

// ✅ 1. Guest asks a question (insert FAQ)
router.post('/ask', (req, res) => {
  const { user_id, question } = req.body;
  const sql = 'INSERT INTO faqs (user_id, question) VALUES (?, ?)';
  db.query(sql, [user_id, question], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Question submitted!', faq_id: result.insertId });
  });
});

// ✅ 2. Clerk answers question (update FAQ)
router.put('/answer/:faq_id', (req, res) => {
  const { faq_id } = req.params;
  const { answer } = req.body;
  const sql = `
    UPDATE faqs 
    SET answer = ?, status = 'answered', answered_at = NOW() 
    WHERE faq_id = ?
  `;
  db.query(sql, [answer, faq_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Answer submitted!' });
  });
});

// ✅ 3. Get all FAQs (with guest name & email)
router.get('/', (req, res) => {
  const sql = `
    SELECT f.faq_id, u.username AS guest_name, u.email AS guest_email, f.question, f.answer, f.status, f.created_at, f.answered_at 
    FROM faqs f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

module.exports = router;
