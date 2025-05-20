import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Login.css';

const Login = ({ setIsAuthenticated, setUsername, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isForgotPassword) {
      // Forgot password flow
      try {
        const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
        setError(response.data.message || 'Failed to send reset email.');
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      }
    } else {
      // Normal login flow
      try {
        const response = await axios.post('http://localhost:5000/api/users/login', { email, password });

        if (!response.data || !response.data.role) {
          setError('Invalid email or password');
          setLoading(false);
          return;
        }

        // Prepare user data object to save in sessionStorage
        const userData = {
          username: response.data.username,
          email,
          userId: response.data.id,   // This is the user id you want to store
          role: response.data.role,
        };

        // Store token and userData in sessionStorage
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(userData));

        // Update app state for logged in user
        setIsAuthenticated(true);
        setUsername(response.data.username);
        setUserRole(response.data.role);

        console.log("User logged in with role:", response.data.role);

        // Redirect based on user role
        if (response.data.role === 'owner') {
          navigate('/revenue');
        } else if (response.data.role === 'clerk') {
          navigate('/revenueclerk');
        } else {
          navigate('/');
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="login-box"
      >
        <h2 className="white-text"><strong>{isForgotPassword ? 'Reset Password' : 'Sign in'}</strong></h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-groupl">
            <label style={{ color: 'white !important' }}>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isForgotPassword && (
            <div className="input-groupl">
             <label style={{ color: 'white !important' }}>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button className='login' type="submit" disabled={loading}>
            {loading ? (isForgotPassword ? 'Sending email...' : 'Logging in...') : (isForgotPassword ? 'Send Reset Email' : 'Login')}
          </button>
        </form>

        {!isForgotPassword ? (
          <p onClick={() => setIsForgotPassword(true)} className="forgot-password-link">Forgot Password?</p>
        ) : (
          <p onClick={() => setIsForgotPassword(false)} className="forgot-password-link">Back to Sign in</p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
