const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// POST: Add a new review
router.post('/add', reviewController.addReview);

// GET: Fetch reviews for a specific room
router.get('/:room_id', reviewController.getReviewsByRoom);

// GET: Fetch all reviews given by a specific user
router.get('/user/:id', reviewController.getReviewsByUser);

module.exports = router;