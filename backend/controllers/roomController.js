const roomModel = require('../models/roomModel');

module.exports = {
    addRoom: async (req, res) => {
        try {
            // Validate required images
            if (!req.files?.image1 || !req.files?.image2 || !req.files?.image3) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Please upload all required images (image1, image2, image3)' 
                });
            }

            const { image1, image2, image3, video } = req.files;
            const roomData = {
                ...req.body,
                imageurl1: `/uploads/${image1[0].filename}`,
                imageurl2: `/uploads/${image2[0].filename}`,
                imageurl3: `/uploads/${image3[0].filename}`,
                video_url: video?.[0] ? `/uploads/${video[0].filename}` : null,
                customizable: req.body.customizable === 'true' || req.body.customizable === 'on',
                wifi: req.body.wifi === 'true' || req.body.wifi === 'on',
                ac: req.body.ac === 'true' || req.body.ac === 'on',
                tv: req.body.tv === 'true' || req.body.tv === 'on'
            };

            const roomId = await roomModel.createRoom(roomData);
            
            res.status(201).json({ 
                success: true,
                message: 'Room added successfully',
                data: { roomId }
            });
        } catch (err) {
            console.error('Error adding room:', err);
            res.status(500).json({ 
                success: false,
                message: 'Failed to add room',
                error: err.message 
            });
        }
    },

    updateRoom: async (req, res) => {
        try {
            const roomId = req.params.roomId;
            const currentRoom = await roomModel.getRoomById(roomId);
            
            if (!currentRoom) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Room not found' 
                });
            }

            const updatedData = {
                name: req.body.name || currentRoom.name,
                maxcount: req.body.maxcount || currentRoom.maxcount,
                phonenumber: req.body.phonenumber || currentRoom.phonenumber,
                rentperday: req.body.rentperday || currentRoom.rentperday,
                room_type: req.body.room_type || currentRoom.room_type,
                description: req.body.description || currentRoom.description,
                imageurl1: req.files?.image1 ? `/uploads/${req.files.image1[0].filename}` : currentRoom.imageurl1,
                imageurl2: req.files?.image2 ? `/uploads/${req.files.image2[0].filename}` : currentRoom.imageurl2,
                imageurl3: req.files?.image3 ? `/uploads/${req.files.image3[0].filename}` : currentRoom.imageurl3,
                video_url: req.files?.video ? `/uploads/${req.files.video[0].filename}` : currentRoom.video_url,
                tv: typeof req.body.tv !== 'undefined' ? 
                    (req.body.tv === '1' || req.body.tv === 1 || req.body.tv === true) : 
                    currentRoom.tv,
                ac: typeof req.body.ac !== 'undefined' ? 
                    (req.body.ac === '1' || req.body.ac === 1 || req.body.ac === true) : 
                    currentRoom.ac,
                wifi: typeof req.body.wifi !== 'undefined' ? 
                    (req.body.wifi === '1' || req.body.wifi === 1 || req.body.wifi === true) : 
                    currentRoom.wifi
            };

            await roomModel.updateRoom(roomId, updatedData);
            res.status(200).json({ 
                success: true,
                message: 'Room updated successfully' 
            });
        } catch (err) {
            console.error('Error updating room:', err);
            res.status(500).json({ 
                success: false,
                message: 'Failed to update room',
                error: err.message 
            });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const roomId = req.params.roomId;
            const hasBookings = await roomModel.hasFutureBookings(roomId);
            
            if (hasBookings) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Room has future bookings and cannot be deleted' 
                });
            }

            await roomModel.deleteRoom(roomId);
            res.status(200).json({ 
                success: true,
                message: 'Room deleted successfully' 
            });
        } catch (err) {
            console.error('Error deleting room:', err);
            res.status(500).json({ 
                success: false,
                message: 'Failed to delete room',
                error: err.message 
            });
        }
    },

    getAllRooms: async (req, res) => {
        try {
            const rooms = await roomModel.getAllRooms();
            // Modified response to be frontend compatible
            res.status(200).json(rooms); // Directly return the array
        } catch (err) {
            console.error('Error fetching rooms:', err);
            res.status(500).json({ 
                success: false,
                message: 'Failed to fetch rooms',
                error: err.message 
            });
        }
    },

    getRoomById: async (req, res) => {
        try {
            const roomId = req.params.roomId;
            const room = await roomModel.getRoomById(roomId);
            
            if (!room) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Room not found' 
                });
            }

            res.status(200).json({ 
                success: true,
                data: room 
            });
        } catch (err) {
            console.error('Error fetching room:', err);
            res.status(500).json({ 
                success: false,
                message: 'Failed to fetch room',
                error: err.message 
            });
        }
    }
};