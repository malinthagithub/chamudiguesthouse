const express = require('express');
const router = express.Router();
const customizationController = require('../controllers/customizationController');

// Customize a room
router.post('/customize', customizationController.customizeRoom);

// Get customizable rooms
router.get('/customizable', customizationController.getCustomizableRooms);

module.exports = router;