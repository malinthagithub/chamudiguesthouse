const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const userModel = require('../models/userModel');
const transporter = require('../services/emailConfig');

// Password reset functions
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await userModel.findGuestByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await authModel.setResetToken(email, resetToken, resetExpires);

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the link below to reset your password:\n\n${resetLink}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await authModel.findUserByResetToken(token);
    if (!user) return res.status(404).json({ message: 'Invalid or expired reset token' });

    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: 'Expired token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: 'New password is required' });

    const user = await authModel.findUserByResetToken(token);
    if (!user) return res.status(404).json({ message: 'Invalid or expired reset token' });

    if (new Date() > new Date(user.reset_expires)) {
      return res.status(400).json({ message: 'Expired token' });
    }

    const hashedPassword = await authModel.hashPassword(newPassword);
    await authModel.updatePassword(user.email, hashedPassword);

    res.status(200).json({ message: 'Password successfully updated!' });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

// Registration functions
exports.registerGuest = async (req, res) => {
  try {
    const requiredFields = ['username', 'email', 'password', 'phoneNumber', 'lastname', 'address1', 'city', 'zipCode', 'country'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ message: 'Please provide all required fields', missingFields });
    }

    const existingUser = await userModel.findGuestByEmail(req.body.email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await authModel.hashPassword(req.body.password);
    const userData = { ...req.body, password: hashedPassword };

    await userModel.createGuestUser(userData);
    res.status(201).json({ message: 'Guest registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

exports.registerOwnerClerk = async (req, res) => {
  try {
    const requiredFields = ['username', 'email', 'password', 'phoneNumber', 'last_name', 'address1'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required',
        missingFields
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Password validation
    if (req.body.password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 8 characters' 
      });
    }

    // Check for existing user
    const existingUser = await userModel.checkExistingOwnerClerk(req.body.email, req.body.username);
    if (existingUser) {
      const existingField = existingUser.email === req.body.email ? 'email' : 'username';
      return res.status(409).json({ 
        success: false,
        message: `${existingField} already exists` 
      });
    }

    const hashedPassword = await authModel.hashPassword(req.body.password);
    const userData = { 
      ...req.body, 
      password: hashedPassword,
      role: req.body.role || 'clerk'
    };

    const clerkId = await userModel.createOwnerClerk(userData);
    res.status(201).json({ 
      success: true,
      message: 'Clerk registered successfully',
      data: {
        clerkId,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: `Error: ${err.message}` 
    });
  }
};

// Login function
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Try guest login first
    let user = await userModel.findGuestByEmail(email);
    let userType = 'guest';

    // If not guest, try owner/clerk
    if (!user) {
      user = await userModel.findOwnerClerkByEmail(email);
      userType = 'owner_clerk';
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await authModel.comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Prepare JWT payload
    const payload = {
      id: userType === 'guest' ? user.id : user.ownerclerk_id,
      username: user.username,
      email: user.email,
      role: user.role || 'guest'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      username: user.username,
      email: user.email,
      role: payload.role,
      id: payload.id
    });
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};