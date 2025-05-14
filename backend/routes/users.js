const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Your database connection
const crypto = require('crypto');
const router = express.Router();
const nodemailer = require('nodemailer');


// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services if needed
    auth: {
      user: process.env.EMAIL_USER,  // Use the email from .env
      pass: process.env.EMAIL_PASS   // Use the app password or normal password from .env
    }
  });
  
  // Forgot Password Route
  // Forgot Password Route
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
      if (err) return res.status(500).json({ message: `Database error: ${err.message}` });
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiration
  
      db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
        [resetToken, resetExpires, email], (err) => {
          if (err) return res.status(500).json({ message: `Database error: ${err.message}` });
  
          const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link below to reset your password:\n\n${resetLink}`
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(500).json({ message: `Failed to send email: ${error.message}` });
            }
  
            res.status(200).json({ message: 'Password reset link sent to your email.' });
          });
        });
    });
  });
  
  // Validate Reset Token Route
  // Inside your router file
  router.get('/validate-reset-token/:token', (req, res) => {
    const { token } = req.params;
    console.log('Token from URL:', token);  // Debugging line
  
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
  
    db.query('SELECT * FROM users WHERE reset_token = ?', [token], (err, result) => {
      if (err) return res.status(500).json({ message: `Database error: ${err.message}` });
  
      console.log('Query result:', result); // Debugging line
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired reset token' });
      }
  
      const user = result[0];
      console.log('User data:', user); // Debugging line
  
      if (new Date() > new Date(user.reset_expires)) {
        return res.status(400).json({ message: 'Expired token' });
      }
  
      res.status(200).json({ message: 'Token is valid' });
    });
  });
  
  
  // Reset Password Route
  router.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
  
    db.query('SELECT * FROM users WHERE reset_token = ?', [token], (err, result) => {
      if (err) return res.status(500).json({ message: `Database error: ${err.message}` });
  
      if (result.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired reset token' });
      }
  
      const user = result[0];
  
      if (new Date() > new Date(user.reset_expires)) {
        return res.status(400).json({ message: 'Expired token' });
      }
  
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ message: `Error hashing password: ${err.message}` });
  
        db.query('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?',
          [hashedPassword, user.email], (err) => {
            if (err) return res.status(500).json({ message: `Database error: ${err.message}` });
  
            res.status(200).json({ message: 'Password successfully updated!' });
          });
      });
    });
  });
  
// 🔹 Register Route (Registers as 'guest' by default, unless 'owner' or 'clerk' is specified)
// Register guest (only into users table)
router.post('/register-guest', async (req, res) => {
    const {
        username, 
        email, 
        password, 
        phoneNumber,
        lastname,
        address1, 
        address2, 
        city, 
        zipCode, 
        country
    } = req.body;

    // Validation
    if (!username || !email || !password || !phoneNumber || !lastname || !address1 || !city || !zipCode || !country) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if user already exists
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: `Database error: ${err.message}` });
            }

            if (result.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into users table
            db.query(
                'INSERT INTO users (username, email, password, phone_number, last_name, address1, address2, city, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [username, email, hashedPassword, phoneNumber, lastname, address1, address2, city, zipCode, country],
                (err, userResult) => {
                    if (err) {
                        return res.status(500).json({ message: `Database error: ${err.message}` });
                    }

                    return res.status(201).json({ message: 'Guest registered successfully!' });
                }
            );
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// Register owner/clerk (into both users and owner_clerk tables)
router.post('/register-ownerclerk', async (req, res) => {
    const {
        username, 
        email, 
        password, 
        phoneNumber,
        last_name, // Changed from lastname to match your frontend
        address1, 
        address2,
        role = 'clerk' // Default to clerk if not provided
    } = req.body;

    // Validation for required fields
    if (!username || !email || !password || !phoneNumber || !last_name || !address1) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert clerk into the owner_clerk table
        db.query(
            'INSERT INTO owner_clerk (username, email, password, phone_number, last_name, address1, address2, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, phoneNumber, last_name, address1, address2, role],
            (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: 'Username or email already exists' });
                    }
                    return res.status(500).json({ message: 'Database error occurred' });
                }

                return res.status(201).json({ 
                    success: true,
                    message: 'Clerk registered successfully!',
                    clerkId: result.insertId 
                });
            }
        );
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// 🔹 Login Route (No security key required for login regardless of role)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    // First, check if the user is a guest (in the 'users' table)
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: `Database error: ${err.message}` });
        }

        // If not found in 'users' table, check if they are a clerk or owner in 'owner_clerk' table
        if (result.length === 0) {
            db.query('SELECT * FROM owner_clerk WHERE email = ?', [email], async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: `Database error: ${err.message}` });
                }

                if (result.length === 0) {
                    return res.status(400).json({ message: 'Invalid email or password' });
                }

                const user = result[0];

                // 🔹 Check password for owner/clerk
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid email or password' });
                }

                // 🔹 Generate JWT token (for owner/clerk)
                const token = jwt.sign(
                    { id: user.id, username: user.username, email: user.email, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                return res.json({
                    message: 'Login successful',
                    token,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    id: user.id
                });
            });
        } else {
            // If found in 'users' table (guest)
            const user = result[0];

            // 🔹 Check password for guest
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // 🔹 Generate JWT token (for guest)
            const token = jwt.sign(
                { id: user.id, username: user.username, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.json({
                message: 'Login successful',
                token,
                username: user.username,
                email: user.email,
                role: user.role,
                id: user.id
            });
        }
    });
});

module.exports = router;
