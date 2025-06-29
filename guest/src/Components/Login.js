import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

/**
 * Login Component
 * Handles user authentication, password reset, and role-based routing
 * @param {function} setIsAuthenticated - Updates global auth state
 * @param {function} setUsername - Sets username in parent component
 * @param {function} setUserRole - Sets user role in parent component
 */
const Login = ({ setIsAuthenticated, setUsername, setUserRole }) => {
  // State variables
  const [email, setEmail] = useState('');          // User email input
  const [password, setPassword] = useState('');    // User password input
  const [error, setError] = useState('');          // Error message display
  const [loading, setLoading] = useState(false);   // Loading state during API calls
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle between login/reset views
  const navigate = useNavigate();                  // For programmatic navigation

  /**
   * Handles form submission for both login and password reset
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ Basic frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isForgotPassword && password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isForgotPassword) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
        setError(response.data.message || 'Password reset email sent.');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to send reset email.');
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
          email: email,
          userId: response.data.id,
          role: response.data.role,
        };

        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUsername(response.data.username);
        setUserRole(response.data.role);

        switch (response.data.role) {
          case 'owner':
            navigate('/revenue');
            break;
          case 'clerk':
            navigate('/revenueclerk');
            break;
          default:
            navigate('/');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    }

    setLoading(false);
  };

  // Component UI
  return (
    <div className="login-container">
      {/* Animated login box */}
      <motion.div
        initial={{ rotateY: 0 }}          // Initial rotation
        animate={{ rotateY: 360 }}        // Full spin animation
        transition={{ duration: 2, ease: "easeInOut" }} // Animation settings
        className="login-box"
      >
        {/* Form title (changes based on mode) */}
        <h2 className="white-text">
          <strong>{isForgotPassword ? 'Reset Password' : 'Sign in'}</strong>
        </h2>

        {/* Error message display */}
        {error && <p className="error">{error}</p>}

        {/* Main form */}
        <form onSubmit={handleSubmit}>
          {/* Email input (always visible) */}
          <div className="input-groupl">
            <label style={{ color: 'white !important' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
          </div>

          {/* Password input (only in login mode) */}
          {!isForgotPassword && (
            <div className="input-groupl">
              <label style={{ color: 'white !important' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
          )}

          {/* Submit button (dynamic text) */}
          <button 
            className='login' 
            type="submit" 
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              isForgotPassword ? 'Sending email...' : 'Logging in...'
            ) : (
              isForgotPassword ? 'Send Reset Email' : 'Login'
            )}
          </button>
        </form>

        {/* Toggle between login and password reset */}
        {!isForgotPassword ? (
          <p 
            onClick={() => setIsForgotPassword(true)} 
            className="forgot-password-link"
            role="button"
            tabIndex="0"
          >
            Forgot Password?
          </p>
        ) : (
          <p 
            onClick={() => setIsForgotPassword(false)} 
            className="forgot-password-link"
            role="button"
            tabIndex="0"
          >
            Back to Sign in
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;