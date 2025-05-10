import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClerkFAQDashboard.css';

const ClerkFAQDashboard = () => {
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, [filter, searchTerm]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/faqs');
      let filteredFaqs = response.data;
      
      if (filter === 'answered') {
        filteredFaqs = filteredFaqs.filter(faq => faq.status === 'answered');
      } else if (filter === 'pending') {
        filteredFaqs = filteredFaqs.filter(faq => !faq.answer);
      }
      
      if (searchTerm) {
        filteredFaqs = filteredFaqs.filter(faq => 
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
          faq.guest_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFaqs(filteredFaqs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFaq || !answer.trim()) return;

    try {
      await axios.put(`http://localhost:5000/api/faqs/answer/${selectedFaq.faq_id}`, { answer });
      setAnswer('');
      setSelectedFaq(null);
      fetchFAQs();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not answered yet';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="faq-dashboard">
      <header className="dashboard-header">
        <h1>FAQ Management</h1>
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search-icon">🔍</i>
          </div>
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Questions
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={filter === 'answered' ? 'active' : ''}
              onClick={() => setFilter('answered')}
            >
              Answered
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            <div className="faq-list">
              {faqs.length === 0 ? (
                <div className="no-results">No FAQs found</div>
              ) : (
                faqs.map(faq => (
                  <div 
                    key={faq.faq_id} 
                    className={`faq-item ${!faq.answer ? 'pending' : ''} ${selectedFaq?.faq_id === faq.faq_id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedFaq(faq);
                      setAnswer(faq.answer || '');
                    }}
                  >
                    <div className="faq-meta">
                      <span className="guest-name">{faq.guest_name}</span>
                      <span className="date">{formatDate(faq.created_at)}</span>
                    </div>
                    <div className="faq-question">{faq.question}</div>
                    {faq.answer && (
                      <div className="faq-status answered">Answered</div>
                    )}
                    {!faq.answer && (
                      <div className="faq-status pending">Pending</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedFaq && (
              <div className="answer-panel">
                <div className="panel-header">
                  <h3>Answer Question</h3>
                </div>
                <div className="question-details">
                  <p><strong>Guest:</strong> {selectedFaq.guest_name} ({selectedFaq.guest_email})</p>
                  <p><strong>Question:</strong> {selectedFaq.question}</p>
                  <p><strong>Asked on:</strong> {formatDate(selectedFaq.created_at)}</p>
                </div>
                <form onSubmit={handleAnswerSubmit}>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your answer here..."
                    rows="6"
                  />
                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      {selectedFaq.answer ? 'Update Answer' : 'Submit Answer'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setSelectedFaq(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClerkFAQDashboard;