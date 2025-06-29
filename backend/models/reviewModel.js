const db = require('../db');

// Helper function to format review data
function formatReview(review) {
    return {
        review_id: review.review_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        username: review.username,
        email: review.email,
        time_ago: review.days_ago === 0 ? 'Today' : 
                 review.days_ago === 1 ? 'Yesterday' : 
                 `${review.days_ago} days ago`
    };
}

module.exports = {
    // Add a new review
    addReview: (reviewData) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO reviews (id, room_id, rating, comment) VALUES (?, ?, ?, ?)';
            db.query(sql, 
                [reviewData.id, reviewData.room_id, reviewData.rating, reviewData.comment], 
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    },

    // Get reviews for a specific room
    getReviewsByRoom: (room_id, sortBy = 'relevant') => {
        return new Promise((resolve, reject) => {
            let orderByClause = 'ORDER BY r.created_at DESC';
            switch (sortBy) {
                case 'newest': orderByClause = 'ORDER BY r.created_at DESC'; break;
                case 'highest': orderByClause = 'ORDER BY r.rating DESC'; break;
                case 'lowest': orderByClause = 'ORDER BY r.rating ASC'; break;
            }

            const sql = `
                SELECT r.review_id, r.rating, r.comment, r.created_at, u.username, u.email, 
                       TIMESTAMPDIFF(DAY, r.created_at, NOW()) AS days_ago
                FROM reviews r
                JOIN users u ON r.id = u.id
                WHERE r.room_id = ? ${orderByClause}
            `;

            db.query(sql, [room_id], (err, results) => {
                if (err) return reject(err);
                resolve(results.map(formatReview));
            });
        });
    },

    // Get reviews by a specific user
    getReviewsByUser: (id, sortBy = 'relevant') => {
        return new Promise((resolve, reject) => {
            let orderByClause = 'ORDER BY r.created_at DESC';
            switch (sortBy) {
                case 'newest': orderByClause = 'ORDER BY r.created_at DESC'; break;
                case 'highest': orderByClause = 'ORDER BY r.rating DESC'; break;
                case 'lowest': orderByClause = 'ORDER BY r.rating ASC'; break;
            }

            const sql = `
                SELECT r.review_id, r.rating, r.comment, r.created_at, u.username, u.email, 
                       TIMESTAMPDIFF(DAY, r.created_at, NOW()) AS days_ago
                FROM reviews r
                JOIN users u ON r.id = u.id
                WHERE r.id = ? ${orderByClause}
            `;

            db.query(sql, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results.map(formatReview));
            });
        });
    }
};