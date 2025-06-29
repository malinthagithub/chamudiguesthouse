const customizationModel = require('../models/customizationModel');
const paymentService = require('../services/paymentService');

module.exports = {
    customizeRoom: async (req, res) => {
        try {
            const { 
                user_id, room_id, beds, hot_water, wifi, ac, minibar, 
                room_service, breakfast, pool_access, view, 
                payment_method_id, checkin_date, checkout_date, total_price 
            } = req.body;

            // Input validation
            if (!checkin_date || !checkout_date) {
                return res.status(400).json({ message: 'Check-in and check-out dates are required' });
            }
            if (isNaN(total_price) || total_price <= 0) {
                return res.status(400).json({ message: 'Invalid total price' });
            }

            // Check room availability
            const existingBookings = await customizationModel.checkRoomAvailability(
                room_id, checkin_date, checkout_date
            );
            if (existingBookings.length > 0) {
                return res.status(400).json({ message: 'Room is already booked' });
            }

            // Process payment
            const paymentIntent = await paymentService.processPayment(total_price, payment_method_id);

            // Create booking
            const bookingId = await customizationModel.createBooking(
                user_id, room_id, checkin_date, checkout_date, total_price
            );

            // Create customization
            const customizationData = {
                user_id,
                room_id,
                beds,
                hot_water,
                wifi,
                ac,
                minibar,
                room_service,
                breakfast,
                pool_access,
                view,
                total_price,
                booking_id: bookingId,
                booking_status: 'confirmed'
            };
            const customizationId = await customizationModel.createCustomization(customizationData);

            // Record payment
            await customizationModel.recordPayment(
                bookingId, 
                total_price, 
                'completed', 
                'stripe', 
                paymentIntent.id
            );

            res.status(200).json({
                message: 'Payment, booking and customization successful',
                bookingId,
                customizationId,
                final_price: total_price
            });

        } catch (err) {
            console.error('Customization error:', err);
            if (err.type === 'StripeCardError') {
                return res.status(400).json({ message: 'Payment failed', error: err.message });
            }
            res.status(500).json({ message: 'Server error during customization' });
        }
    },

    getCustomizableRooms: async (req, res) => {
        try {
            const rooms = await customizationModel.getCustomizableRooms();
            res.json(rooms);
        } catch (err) {
            console.error('Error fetching customizable rooms:', err);
            res.status(500).json({ error: 'Failed to fetch customizable rooms' });
        }
    }
};