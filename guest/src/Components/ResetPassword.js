import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Validate token on page load to ensure it's valid
    axios.get(`http://localhost:5000/api/users/validate-reset-token/${token}`)
      .then(response => {
        setMessage('Enter your new password below.');
      })
      .catch(err => {
        setError('Invalid or expired reset token.');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { newPassword });
      setMessage('Password successfully updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h3>Reset Your Password</h3>
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
