const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Submit a new question
router.post('/ask', faqController.submitQuestion);

// Answer a question
router.put('/answer/:faq_id', faqController.submitAnswer);

// Get all FAQs
router.get('/', faqController.getAllFaqs);

module.exports = router;