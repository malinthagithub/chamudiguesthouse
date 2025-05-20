const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');  // Ensure this path is correct based on your database connection setup

const router = express.Router();

// Create the uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Ensure the uploads folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Make sure filenames are unique by appending timestamp
    }
});

const upload = multer({ storage: storage });

// API to add a new room
router.post('/add', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    // Ensure all required images are uploaded
    if (!req.files || !req.files.image1 || !req.files.image2 || !req.files.image3) {
        return res.status(400).json({ message: 'Please upload all required images.' });
    }

    // Destructure request body
    const {
        name,
        maxcount,
        phonenumber,
        rentperday,
        room_type,
        room_size,
        description,
        customizable,
        wifi,
        ac,
        tv
    } = req.body;

    const { image1, image2, image3, video } = req.files;

    console.log('Uploaded Files:', req.files);
    console.log('Request Body:', req.body);

    // Assign image and video URLs
    const imageurl1 = `/uploads/${image1[0].filename}`;
    const imageurl2 = `/uploads/${image2[0].filename}`;
    const imageurl3 = `/uploads/${image3[0].filename}`;
    const videoUrl = video && video[0] ? `/uploads/${video[0].filename}` : null;

    // Construct room object
    const newRoom = {
        name,
        maxcount,
        phonenumber,
        rentperday,
        room_type,
        room_size,
        imageurl1,
        imageurl2,
        imageurl3,
        video_url: videoUrl,
        description,
        customizable: customizable === 'true' || customizable === 'on',
        wifi: wifi === 'true' || wifi === 'on',
        ac: ac === 'true' || ac === 'on',
        tv: tv === 'true' || tv === 'on',

    };

    // Insert into database
    db.query('INSERT INTO rooms SET ?', newRoom, (err, result) => {
        if (err) {
            console.error('Error inserting room:', err);
            return res.status(500).json({ message: 'Error inserting room into database' });
        }
        res.status(200).json({ message: 'Room added successfully', roomId: result.insertId });
    });
});




// Update room details with booking_id instead of bookin_id
router.put('/update/:roomId', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
   
    const roomId = req.params.roomId;
    const {
        name,
        maxcount,
        phonenumber,
        rentperday,
        room_type,
        description,
        tv,
        ac,
        wifi
    } = req.body;

    db.query(
        'SELECT * FROM rooms WHERE room_id = ?',
        [roomId],
        (err, results) => {
            if (err || results.length === 0) {
                console.error('Error fetching current room details:', err);
                return res.status(500).json({ message: 'Error fetching current room details' });
            }

            const current = results[0];

            const updatedName = name || current.name;
            const updatedMaxcount = maxcount || current.maxcount;
            const updatedPhonenumber = phonenumber || current.phonenumber;
            const updatedRentPerDay = rentperday || current.rentperday;
            const updatedRoomType = room_type || current.room_type;
            const updatedDescription = description || current.description;

            const imageUrl1 = req.files?.image1 ? `/uploads/${req.files.image1[0].filename}` : current.imageurl1;
            const imageUrl2 = req.files?.image2 ? `/uploads/${req.files.image2[0].filename}` : current.imageurl2;
            const imageUrl3 = req.files?.image3 ? `/uploads/${req.files.image3[0].filename}` : current.imageurl3;
            const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : current.video_url;

            const updatedTv = typeof tv !== 'undefined' ? (tv === '1' || tv === 1 || tv === true) : current.tv;
            const updatedAc = typeof ac !== 'undefined' ? (ac === '1' || ac === 1 || ac === true) : current.ac;
            const updatedWifi = typeof wifi !== 'undefined' ? (wifi === '1' || wifi === 1 || wifi === true) : current.wifi;


            db.query(
                'UPDATE rooms SET name = ?, maxcount = ?, phonenumber = ?, rentperday = ?, imageurl1 = ?, imageurl2 = ?, imageurl3 = ?, video_url = ?, room_type = ?, description = ?, tv = ?, ac = ?, wifi = ? WHERE room_id = ?',
                [updatedName, updatedMaxcount, updatedPhonenumber, updatedRentPerDay, imageUrl1, imageUrl2, imageUrl3, videoUrl, updatedRoomType, updatedDescription, updatedTv, updatedAc, updatedWifi, roomId],
                (updateErr, result) => {
                    if (updateErr) {
                        console.error('Error updating room:', updateErr);
                        return res.status(500).json({ message: 'Error updating room' });
                    }
                    res.status(200).json({ message: 'Room updated successfully' });
                }
            );
        }
    );
});





// API to delete a room
router.delete('/delete/:roomId', (req, res) => {
    const roomId = req.params.roomId;

    // Check if the room has future bookings
    db.query('SELECT * FROM bookings WHERE room_id = ? AND checkin_date >= CURDATE()', [roomId], (err, bookings) => {
        if (err) {
            console.error('Error checking bookings:', err);
            return res.status(500).json({ message: 'Error checking bookings' });
        }

        if (bookings.length > 0) {
            return res.status(400).json({ message: 'Room has future bookings and cannot be deleted' });
        }

        // Delete the room if there are no future bookings
        db.query('DELETE FROM rooms WHERE room_id = ?', [roomId], (err, result) => {
            if (err) {
                console.error('Error deleting room:', err);
                return res.status(500).json({ message: 'Error deleting room' });
            }
            res.status(200).json({ message: 'Room deleted successfully' });
        });
    });
});

// API to get all rooms
router.get('/all', (req, res) => {
    db.query('SELECT * FROM rooms', (err, rooms) => {
        if (err) {
            console.error('Error fetching rooms:', err);
            return res.status(500).json({ message: 'Error fetching rooms' });
        }
        res.status(200).json(rooms);
    });
});

// API to get a specific room by roomId
router.get('/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    db.query('SELECT * FROM rooms WHERE room_id = ?', [roomId], (err, room) => {
        if (err) {
            console.error('Error fetching room:', err);
            return res.status(500).json({ message: 'Error fetching room' });
        }

        if (room.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.status(200).json(room[0]);  // Sending the first (and only) room object
    });
});

module.exports = router;
