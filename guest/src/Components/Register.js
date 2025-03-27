import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Make sure to update styles accordingly

const Register = () => {
  // Initialize state with empty values for a fresh form on every page refresh
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    address1: '',
    address2: '',
    city: '',
    zipCode: '',
    country: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      console.log(response.data);
      setIsSuccess(true);
      setFormData({
        username: '',
        lastname:'',
        email: '',
        password: '',
        phoneNumber: '',
        address1: '',
        address2: '',
        city: '',
        zipCode: '',
        country: '',
      });  // Clear the form after successful submission

      setTimeout(() => {
        navigate('/login'); // Navigate to the login page after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <div className="form-container">
        <h2>Sing Up</h2>

        {isSuccess && (
          <div className="success-message">
            <p>Registration successful! Redirecting to login...</p>
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="form-wrapper">
          {/* Personal Information Form */}
          <form className="form-left" onSubmit={handleSubmit}>
            <h3>Personal Information</h3>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Fristname"
              required
              autoComplete="off" // Disable autocomplete for better privacy
            />
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Lastname"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              autoComplete="off"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              autoComplete="off"
              
            />
            
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              autoComplete="off"
            />
          </form>

          {/* Address Information Form */}
          <form className="form-right" onSubmit={handleSubmit}>
            <h3>Address Information</h3>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder="Address Line 1"
              required
            />
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              placeholder="Address Line 2"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
            />
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="Zip Code"
              required
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              required
            />
            <div className="form-button">
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
