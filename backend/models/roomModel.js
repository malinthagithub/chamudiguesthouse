const db = require("../db");

module.exports = {
    createRoom: (roomData) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO rooms SET ?', roomData, (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    },

    updateRoom: (roomId, updatedData) => {
        return new Promise((resolve, reject) => {
            db.query(
                'UPDATE rooms SET ? WHERE room_id = ?',
                [updatedData, roomId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.affectedRows);
                }
            );
        });
    },

    deleteRoom: (roomId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM rooms WHERE room_id = ?', [roomId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows);
            });
        });
    },

    getAllRooms: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM rooms', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getRoomById: (roomId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM rooms WHERE room_id = ?', [roomId], (err, results) => {
                if (err) return reject(err);
                resolve(results[0] || null);
            });
        });
    },

    hasFutureBookings: (roomId) => {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND checkin_date >= CURDATE()',
                [roomId],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0].count > 0);
                }
            );
        });
    }
};