const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post('/customize', async (req, res) => {
    const { 
        user_id, room_id, beds, hot_water, wifi, ac, minibar, room_service, 
        breakfast, pool_access, view, payment_method_id, checkin_date, checkout_date, total_price 
    } = req.body;

    // Step 1: Check if the room is already booked for the selected dates
    const checkAvailabilityQuery = `
        SELECT * FROM bookings 
        WHERE room_id = ? 
        AND ((checkin_date <= ? AND checkout_date >= ?) OR (checkin_date <= ? AND checkout_date >= ?))
    `;

    db.query(checkAvailabilityQuery, [room_id, checkout_date, checkin_date, checkin_date, checkout_date], (err, results) => {
        if (err) {
            console.error('Error checking room availability:', err);
            return res.status(500).json({ message: 'Database error while checking availability' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Room is already booked for the selected dates' });
        }

        if (isNaN(total_price) || total_price <= 0) {
            return res.status(400).json({ message: 'Invalid total price' });
        }

        // Step 2: Insert customization
        const insertCustomizationQuery = `
            INSERT INTO customizations (user_id, room_id, beds, hot_water, wifi, ac, minibar, 
            room_service, breakfast, pool_access, view, total_price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertCustomizationQuery, [
            user_id, room_id, beds, hot_water, wifi, ac, minibar, 
            room_service, breakfast, pool_access, view, total_price
        ], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error saving customization' });
            }

            const customizationId = result.insertId;

            // Step 3: Insert booking
            const insertBookingQuery = `
                INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, status, total_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(insertBookingQuery, [user_id, room_id, checkin_date, checkout_date, 'pending', total_price], (bookingErr, bookingResult) => {
                if (bookingErr) {
                    console.error(bookingErr);
                    return res.status(500).json({ message: 'Error saving booking' });
                }

                const bookingId = bookingResult.insertId;

                // Step 4: Process payment with Stripe
                stripe.paymentIntents.create({
                    amount: Math.round(total_price * 100),
                    currency: 'usd',
                    payment_method: payment_method_id,
                    confirm: true,
                    automatic_payment_methods: {
                        enabled: true,
                        allow_redirects: 'never',
                    },
                })
                .then(paymentIntent => {
                    // Step 5: Insert payment
                    const insertPaymentQuery = `
                        INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id)
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(insertPaymentQuery, [
                        bookingId, total_price, 'completed', 'stripe', paymentIntent.id
                    ], (paymentErr) => {
                        if (paymentErr) {
                            console.error(paymentErr);
                            return res.status(500).json({ message: 'Error saving payment' });
                        }

                        // Step 6: Update customization and booking statuses
                        const updateCustomizationQuery = `
                            UPDATE customizations SET booking_status = ? WHERE customization_id = ?
                        `;

                        db.query(updateCustomizationQuery, ['confirmed', customizationId], (updateErr) => {
                            if (updateErr) {
                                console.error(updateErr);
                                return res.status(500).json({ message: 'Error updating customization status' });
                            }

                            const updateBookingQuery = `
                                UPDATE bookings SET status = 'confirmed' WHERE booking_id = ?
                            `;

                            db.query(updateBookingQuery, [bookingId], (updateBookingErr) => {
                                if (updateBookingErr) {
                                    console.error(updateBookingErr);
                                    return res.status(500).json({ message: 'Error updating booking status' });
                                }

                                return res.status(200).json({
                                    message: 'Customization, booking, and payment processed successfully',
                                    customizationId: customizationId,
                                    final_price: total_price
                                });
                            });
                        });
                    });
                })
                .catch(err => {
                    console.error(err);
                    return res.status(400).json({ message: 'Payment failed', error: err });
                });
            });
        });
    });
});

module.exports = router;
