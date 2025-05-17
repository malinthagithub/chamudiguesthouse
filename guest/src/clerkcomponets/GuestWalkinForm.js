import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GuestWalkinForm.css';

const GuestWalkinForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { roomId, checkin, checkout } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    id_proof: '',
    country: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.id_proof || !formData.country) {
      alert('Please fill all fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/guest-walkin', {
        ...formData,
        created_at: new Date(),
      });

      navigate('/payment', { 
        state: { 
          roomId, 
          checkin, 
          checkout, 
          guest_walkin_id: response.data.guest_walkin_id 
        } 
      });

    } catch (error) {
      console.error('Error saving guest data:', error);
      alert('Failed to save guest details. Please try again.');
    }
  };

  return (
    <div className="guest-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Guest Registration</h2>
          <p>Please enter your details to complete booking</p>
        </div>
        
        <form onSubmit={handleSubmit} className="elegant-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <label>Full Name</label>
            <span className="input-border"></span>
          </div>
          
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label>Phone Number</label>
            <span className="input-border"></span>
          </div>
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Email Address</label>
            <span className="input-border"></span>
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="id_proof"
              value={formData.id_proof}
              onChange={handleChange}
              required
            />
            <label>ID Proof Number</label>
            <span className="input-border"></span>
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <label>Country</label>
            <span className="input-border"></span>
          </div>
          
          <button type="submit" className="submit-btn">
            <span>Proceed to Payment</span>
            <svg width="13px" height="10px" viewBox="0 0 13 10">
              <path d="M1,5 L11,5"></path>
              <polyline points="8 1 12 5 8 9"></polyline>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestWalkinForm;