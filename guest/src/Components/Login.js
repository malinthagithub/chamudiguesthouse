import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';  // Import Framer Motion for 3D effects
import './Login.css'; // Ensure this file has proper styles

const Login = ({ setIsAuthenticated, setUsername }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isForgotPassword) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
        setError(response.data.message || 'Failed to send reset email.');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      }
    } else {
      try {
        const response = await axios.post('http://localhost:5000/api/users/login', { email, password });

        if (!response.data || !response.data.role) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }

        const userData = {
          username: response.data.username,
          email,
          userId: response.data.id,
          role: response.data.role
        };
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUsername(response.data.username);

        // Navigate based on user role
        navigate(response.data.role === 'owner' ? '/revenue' : response.data.role === 'clerk' ? '/revenueclerk' : '/');

      } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* 3D Rotation Effect (Rotates Once) */}
      <div
       
        transition={{ duration: 2, ease: "easeInOut" }} // Smooth transition in 2 seconds
        className="login-box"
      >
        <h2 className="white-text"><strong>{isForgotPassword ? 'Reset Password' : 'Sing in'}</strong></h2>

        {/* Display Error Message */}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input field will only be displayed when not in "Forgot Password" mode */}
          {!isForgotPassword && (
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {/* Login button with loading state */}
          <button className='login' type="submit" disabled={loading}>
            {loading ? (isForgotPassword ? 'Sending email...' : 'Logging in...') : (isForgotPassword ? 'Send Reset Email' : 'Login')}
          </button>
        </form>

        {/* Forgot Password link toggles between login and reset password */}
        {!isForgotPassword ? (
          <p onClick={() => setIsForgotPassword(true)} className="forgot-password-link">Forgot Password?</p>
        ) : (
          <p onClick={() => setIsForgotPassword(false)} className="forgot-password-link">Back to Sing in</p>
        )}
      </div>
    </div>
  );
};

export default Login;
