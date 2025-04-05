const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('../db'); // MySQL connection

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads/profile_pics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Folder to store photos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  }
});

const upload = multer({ storage: storage });

/**
 * @route GET /api/user/:id
 * @desc Fetch user profile (READ-ONLY)
 */
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  const query = `
    SELECT id, username, email,loyalty_points,address1,address2,city, phone_number,country,loyalty_points,
    COALESCE(profile_photo, '/uploads/profile_pics/default.png') AS profile_photo
    FROM users WHERE id = ?`;

  mysql.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching profile', error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(result[0]); // Send user profile data
  });
});

/**
 * @route PUT /api/user/upload-photo/:id
 * @desc Upload and update profile photo (ONLY)
 */
router.put('/upload-photo/:id', (req, res) => {
    upload.single('photo')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Multer error', error: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'File upload failed', error: err.message });
      }
  
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Ensure you are sending a form-data request with a "photo" file.' });
      }
  
      const userId = req.params.id;
      const photoPath = `/uploads/profile_pics/${req.file.filename}`;
  
      const query = 'UPDATE users SET profile_photo = ? WHERE id = ?';
      mysql.query(query, [photoPath, userId], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating profile photo', error: err });
        }
        res.status(200).json({ profilePhoto: photoPath, message: 'Profile photo updated successfully' });
      });
    });
  });
  // PUT route for updating profile photo (ensure consistent HTTP method)
router.post('/upload-photo/:id', upload.single('photo'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Ensure you are sending a form-data request with a "photo" file.' });
    }
  
    const userId = req.params.id;
    const photoPath = `/uploads/profile_pics/${req.file.filename}`;
  
    const query = 'UPDATE users SET profile_photo = ? WHERE id = ?';
    mysql.query(query, [photoPath, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile photo', error: err });
      }
      res.status(200).json({ profilePhotoUrl: photoPath, message: 'Profile photo updated successfully' });
    });
  });
  
  
module.exports = router;
