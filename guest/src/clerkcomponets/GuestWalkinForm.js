import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GuestWalkinForm.css';

const GuestWalkinForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract from location.state, fallback to empty
  const { roomId, checkin, checkout } = location.state || {};
  
  // User session info
  const ownerclerk_id = JSON.parse(sessionStorage.getItem('userData'))?.userId;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    id_proof: '',
    country: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all required fields
    if (!formData.name || !formData.phone || !formData.email || !formData.id_proof || !formData.country) {
      alert('Please fill all fields.');
      setIsSubmitting(false);
      return;
    }

    if (!ownerclerk_id) {
      alert('User session expired. Please login again.');
      setIsSubmitting(false);
      return;
    }

    if (!roomId || !checkin || !checkout) {
      alert('Missing booking dates or room info. Please start booking again.');
      setIsSubmitting(false);
      return;
    }

    const guestWalkinData = {
      ...formData,
      created_at: new Date(),
      ownerclerk_id,
    };

    // Save full booking data to sessionStorage as fallback
    const bookingData = {
      roomId,
      checkin,
      checkout,
      guest_walkin_data: guestWalkinData,
    };
    sessionStorage.setItem('walkinBookingData', JSON.stringify(bookingData));

    // Navigate to payment passing data via state
    navigate('/payment', { state: bookingData });
  };

  return (
    <div className="guest-walkin-container">
      <div className="guest-walkin-card">
        <header className="guest-walkin-header">
          <h1>Guest Registration</h1>
          <div className="guest-walkin-progress">
            <div className="progress-step active">
              <div className="step-number">1</div>
              <div className="step-label">Details</div>
            </div>
            <div className="progress-step">
              <div className="step-number">2</div>
              <div className="step-label">Payment</div>
            </div>
          </div>
        </header>

        <div className="guest-walkin-content">
          <form onSubmit={handleSubmit} className="guest-walkin-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label>ID Proof Number</label>
                <input
                  type="text"
                  name="id_proof"
                  value={formData.id_proof}
                  onChange={handleChange}
                  placeholder="Passport/ID number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    Proceed to Payment
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuestWalkinForm;