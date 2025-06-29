const reviewModel = require('../models/reviewModel');

module.exports = {
    // Add a new review
    addReview: async (req, res) => {
        try {
            const { id, room_id, rating, comment } = req.body;
            
            if (!id || !room_id || !rating) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            await reviewModel.addReview({ id, room_id, rating, comment });
            res.status(201).json({ message: 'Review added successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get reviews for a specific room
    getReviewsByRoom: async (req, res) => {
        try {
            const { room_id } = req.params;
            const { sortBy = 'relevant' } = req.query;
            
            const reviews = await reviewModel.getReviewsByRoom(room_id, sortBy);
            res.status(200).json(reviews);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get reviews by a specific user
    getReviewsByUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { sortBy = 'relevant' } = req.query;
            
            const reviews = await reviewModel.getReviewsByUser(id, sortBy);
            res.status(200).json(reviews);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};