const faqModel = require('../models/faqModel');

module.exports = {
    // Submit a new question
    submitQuestion: async (req, res) => {
        try {
            const { user_id, question } = req.body;
            const faqId = await faqModel.createQuestion(user_id, question);
            res.status(201).json({ 
                message: 'Question submitted!', 
                faq_id: faqId 
            });
        } catch (error) {
            console.error('Error submitting question:', error);
            res.status(500).json({ error: 'Failed to submit question' });
        }
    },

    // Answer a question
    submitAnswer: async (req, res) => {
        try {
            const { faq_id } = req.params;
            const { answer } = req.body;
            const affectedRows = await faqModel.answerQuestion(faq_id, answer);
            
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Question not found' });
            }
            
            res.json({ message: 'Answer submitted!' });
        } catch (error) {
            console.error('Error submitting answer:', error);
            res.status(500).json({ error: 'Failed to submit answer' });
        }
    },

    // Get all FAQs
    getAllFaqs: async (req, res) => {
        try {
            const faqs = await faqModel.getAllFaqs();
            res.json(faqs);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            res.status(500).json({ error: 'Failed to fetch FAQs' });
        }
    }
};