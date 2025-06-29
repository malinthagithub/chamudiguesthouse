const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.get('/validate-reset-token/:token', authController.validateResetToken);
router.post('/reset-password/:token', authController.resetPassword);

// Registration routes
router.post('/register-guest', authController.registerGuest);
router.post('/register-ownerclerk', authController.registerOwnerClerk);

// Login route
router.post('/login', authController.login);

module.exports = router;