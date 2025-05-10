// components/FaqForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FaqForm.css'; // Create this CSS file

function FaqForm({ isOpen, onClose }) {
  const [question, setQuestion] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [viewingAnswers, setViewingAnswers] = useState(false);

  // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem("userData"));
  const userId = user ? user.userId : null;

  useEffect(() => {
    if (viewingAnswers) {
      fetchFaqs();
    }
  }, [viewingAnswers]);

  async function fetchFaqs() {
    try {
      const response = await axios.get('http://localhost:5000/api/faqs');
      setFaqs(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch FAQs');
    }
  }

  async function submitFaq(e) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!userId) {
      setError('Please login first to submit a question.');
      setSuccess('');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/faqs/ask', {
        user_id: userId,
        question
      });

      setSuccess('Your question has been submitted!');
      setQuestion('');
      setError('');
      
      // Auto-close after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="faq-modal">
      <div className="faq-modal-content">
        <div className="faq-modal-header">
          <h3>{viewingAnswers ? 'Q&A' : 'Ask a Question'}</h3>
          
        </div>
        
        <div className="faq-modal-body">
          {success && (
            <div className="faq-alert faq-alert-success">
              {success}
            </div>
          )}
          {error && (
            <div className="faq-alert faq-alert-error">
              {error}
            </div>
          )}
          
          {!viewingAnswers ? (
            <form onSubmit={submitFaq}>
              <div className="faq-form-group">
                <textarea
                  className="faq-textarea"
                  rows="5"
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              
              <div className="faq-form-actions">
                <button 
                  type="button" 
                  className="faq-btn faq-btn-secondary" 
                  onClick={() => setViewingAnswers(true)}
                >
                  View Answers
                </button>
                <button 
                  type="button" 
                  className="faq-btn faq-btn-secondary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="faq-btn faq-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="faq-spinner"></span> Submitting...
                    </>
                  ) : 'Submit Question'}
                </button>
              </div>
            </form>
          ) : (
            <div className="faq-answers-container">
              <button 
                className="faq-btn faq-btn-back"
                onClick={() => setViewingAnswers(false)}
              >
                &larr; Back to Ask Question
              </button>
              
              <div className="faq-list">
                {faqs.length > 0 ? (
                  faqs.map(faq => (
                    <div key={faq._id} className="faq-item">
                      <div className="faq-question">
                        <strong>Q:</strong> {faq.question}
                      </div>
                      {faq.answer ? (
                        <div className="faq-answer">
                          <strong>A:</strong> {faq.answer}
                        </div>
                      ) : (
                        <div className="faq-answer pending">
                          (Answer pending from clerk)
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="faq-empty">No questions and answers yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FaqForm;