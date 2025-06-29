const db = require('../db');

module.exports = {
    // Submit a new question
    createQuestion: (userId, question) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO faqs (user_id, question) VALUES (?, ?)';
            db.query(sql, [userId, question], (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    },

    // Answer a question
    answerQuestion: (faqId, answer) => {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE faqs 
                SET answer = ?, status = 'answered', answered_at = NOW() 
                WHERE faq_id = ?
            `;
            db.query(sql, [answer, faqId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows);
            });
        });
    },

    // Get all FAQs with user details
    getAllFaqs: () => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT f.faq_id, u.username AS guest_name, u.email AS guest_email, 
                       f.question, f.answer, f.status, f.created_at, f.answered_at 
                FROM faqs f
                JOIN users u ON f.user_id = u.id
                ORDER BY f.created_at DESC
            `;
            db.query(sql, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};