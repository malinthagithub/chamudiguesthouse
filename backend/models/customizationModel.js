const db = require('../db');

module.exports = {
    checkRoomAvailability: (roomId, checkinDate, checkoutDate) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM bookings 
                WHERE room_id = ? 
                AND status NOT IN ('cancelled', 'pending')
                AND (
                    (checkin_date <= ? AND checkout_date > ?) OR
                    (checkin_date < ? AND checkout_date >= ?) OR
                    (checkin_date >= ? AND checkout_date <= ?)
                )
            `;
            db.query(query, [
                roomId, checkinDate, checkoutDate,
                checkinDate, checkoutDate,
                checkinDate, checkoutDate
            ], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    createBooking: (userId, roomId, checkinDate, checkoutDate, totalPrice) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status, total_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [userId, roomId, checkinDate, checkoutDate, 'confirmed', totalPrice], 
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result.insertId);
                });
        });
    },

    createCustomization: (customizationData) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO customizations SET ?
            `;
            db.query(query, customizationData, (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    },

    recordPayment: (bookingId, amount, paymentStatus, paymentMethod, transactionId) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(query, [bookingId, amount, paymentStatus, paymentMethod, transactionId], 
                (err) => {
                    if (err) return reject(err);
                    resolve();
                });
        });
    },

    getCustomizableRooms: () => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM rooms WHERE customizable = TRUE';
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};