/**
 * Authentication Controller
 * Handles user authentication, registration, and password reset functionality
 */

// Import required modules
const userModel = require('../models/userModel');  // Database operations
const bcrypt = require('bcryptjs');               // Password hashing
const jwt = require('jsonwebtoken');              // JWT token generation
const crypto = require('crypto');                 // Cryptography functions
const nodemailer = require('nodemailer');         // Email sending

// Configure email transporter for password reset emails
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Using Gmail SMTP
    auth: {
        user: process.env.EMAIL_USER,  // From environment variables
        pass: process.env.EMAIL_PASS
    }
});

module.exports = {
    

    /**
     * Forgot Password - Initiates password reset process
     * 1. Validates email exists
     * 2. Generates secure reset token
     * 3. Sends reset link via email
     */
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            
            // Validation
            if (!email) return res.status(400).json({ message: 'Email is required' });
            
            // Check user existence
            const user = await userModel.findUserByEmail(email);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Generate secure token (32-byte hex string)
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiration
            
            // Store token in database
            await userModel.updateResetToken(email, resetToken, resetExpires);

            // Create reset link
            const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
            
            // Configure email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Request',
                text: `Click the link below to reset your password:\n\n${resetLink}`
            };

            // Send email
            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    console.error('Email send error:', error);
                    return res.status(500).json({ message: 'Failed to send reset email' });
                }
                res.status(200).json({ message: 'Password reset link sent to your email.' });
            });

        } catch (err) {
            console.error('Forgot password error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    /**
     * Validate Reset Token - Checks if token is valid and not expired
     */
    validateResetToken: async (req, res) => {
        try {
            const { token } = req.params;
            
            // Validation
            if (!token) return res.status(400).json({ message: 'Token is required' });
            
            // Check token validity
            const user = await userModel.validateResetToken(token);
            if (!user) return res.status(404).json({ message: 'Invalid or expired reset token' });

            // Check expiration
            if (new Date() > new Date(user.reset_expires)) {
                return res.status(400).json({ message: 'Expired token' });
            }

            res.status(200).json({ message: 'Token is valid' });
        } catch (err) {
            console.error('Token validation error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    /**
     * Reset Password - Updates user password after token validation
     * 1. Validates token
     * 2. Hashes new password
     * 3. Updates database
     */
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
            
            // Validations
            if (!newPassword) return res.status(400).json({ message: 'New password is required' });
            
            // Verify token
            const user = await userModel.validateResetToken(token);
            if (!user) return res.status(404).json({ message: 'Invalid or expired reset token' });
            
            // Check expiration
            if (new Date() > new Date(user.reset_expires)) {
                return res.status(400).json({ message: 'Expired token' });
            }

            // Hash and update password
            const hashedPassword = await bcrypt.hash(newPassword, 10); // Salt rounds = 10
            await userModel.updatePassword(token, hashedPassword);

            res.status(200).json({ message: 'Password successfully updated!' });
        } catch (err) {
            console.error('Password reset error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

   

    /**
     * Register Guest - Creates new guest user account
     * Includes comprehensive field validation
     */
    registerGuest: async (req, res) => {
        try {
            // Required fields
            const requiredFields = ['username', 'email', 'password', 'phoneNumber', 
                                  'lastname', 'address1', 'city', 'zipCode', 'country'];
            
            // Check for missing fields
            const missingFields = requiredFields.filter(field => !req.body[field]);
            if (missingFields.length > 0) {
                return res.status(400).json({ 
                    message: 'Missing required fields',
                    missingFields 
                });
            }

            // Check for existing user
            const existingUser = await userModel.findUserByEmail(req.body.email);
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            // Create new guest
            await userModel.createGuest(req.body);
            
            res.status(201).json({ 
                message: 'Guest registered successfully!',
                data: {
                    email: req.body.email,
                    username: req.body.username
                }
            });
        } catch (err) {
            console.error('Guest registration error:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    /**
     * Register Owner/Clerk - Creates staff account with additional validation
     */
    registerOwnerClerk: async (req, res) => {
        try {
            // Required fields
            const requiredFields = ['username', 'email', 'password', 'phoneNumber', 'last_name', 'address1'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required',
                    missingFields
                });
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(req.body.email)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email format' 
                });
            }

            // Password strength validation
            if (req.body.password.length < 8) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Password must be at least 8 characters' 
                });
            }

            // Check for existing user
            const existingUser = await userModel.findOwnerClerkByEmail(req.body.email);
            if (existingUser) {
                return res.status(409).json({ 
                    success: false,
                    message: existingUser.email === req.body.email ? 'Email already exists' : 'Username already exists'
                });
            }

            // Create staff account
            const result = await userModel.createOwnerClerk({
                ...req.body,
                role: req.body.role || 'clerk'  // Default to clerk if role not specified
            });

            res.status(201).json({ 
                success: true,
                message: 'Account registered successfully',
                data: {
                    userId: result.insertId,
                    email: req.body.email,
                    role: req.body.role || 'clerk'
                }
            });
        } catch (err) {
            console.error('Staff registration error:', err);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    },

    

    /**
     * Login - Authenticates users (both guests and staff)
     * 1. Validates credentials
     * 2. Issues JWT token
     * 3. Returns user data
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            // Basic validation
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Please provide both email and password' 
                });
            }

            // Check guest users first
            let user = await userModel.findUserByEmail(email);
            let userType = 'user';

            // If not guest, check staff accounts
            if (!user) {
                user = await userModel.findOwnerClerkByEmail(email);
                userType = 'owner_clerk';
                if (!user) return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            // Generate JWT token (expires in 1 hour)
            const token = jwt.sign(
                {
                    id: userType === 'user' ? user.id : user.ownerclerk_id,
                    username: user.username,
                    email: user.email,
                    role: user.role || 'guest'  // Default role
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Successful response
            res.json({
                message: 'Login successful',
                token,  // JWT token
                user: {
                    username: user.username,
                    email: user.email,
                    role: user.role || 'guest',
                    id: userType === 'user' ? user.id : user.ownerclerk_id
                }
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ 
                message: 'Internal server error' 
            });
        }
    }
};