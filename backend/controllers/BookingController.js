const BookingModel = require("../models/BookingModel");
const PaymentModel = require("../models/PaymentModel");
const PaymentService = require("../services/PaymentBookService");
const EmailService = require("../services/EmailService");
const LoyaltyService = require("../services/LoyaltyService");

const emailService = new EmailService();

class BookingController {
  async bookRoom(req, res) {
    const {
      user_id,
      room_id,
      checkin_date,
      checkout_date,
      total_amount,
      payment_method_id,
    } = req.body;

    console.log("Received data:", req.body);

    try {
      // Validate required fields
      if (!user_id || !room_id || !checkin_date || !checkout_date || !total_amount || !payment_method_id) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Get current loyalty points
      const currentPoints = await BookingModel.getUserLoyaltyPoints(user_id);

      // Calculate discount and new total
      const { discount, usedPoints } = LoyaltyService.calculateDiscount(currentPoints, total_amount);
      const adjustedAmount = total_amount - discount;

      // Process payment
      const paymentIntent = await PaymentService.processPayment(payment_method_id, adjustedAmount);

      // Create booking record
      const booking_id = await BookingModel.createBooking(
        user_id,
        room_id,
        checkin_date,
        checkout_date,
        adjustedAmount
      );

      // Create and update payment record
      await PaymentModel.createPayment(booking_id, adjustedAmount, paymentIntent.id);
      await PaymentModel.updatePaymentStatus(paymentIntent.id);

      // Calculate and update loyalty points
      const newPoints = LoyaltyService.calculateNewPoints(currentPoints, usedPoints);
      await BookingModel.updateLoyaltyPoints(user_id, newPoints);

      // Get user email and send confirmation
      const userEmail = await BookingModel.getUserEmail(user_id);
      await emailService.sendBookingConfirmation(userEmail, {
        room_id,
        checkin_date,
        checkout_date,
        total_amount: adjustedAmount,
        discount,
        newPoints
      });

      // Success response
      res.json({
        message: "Booking confirmed & payment successful!",
        booking_id,
        discount,
        total_amount: adjustedAmount,
        loyaltyPoints: newPoints,
      });

    } catch (error) {
      console.error("Error during booking:", error);
      res.status(500).json({
        message: "Payment or booking failed.",
        error: error.message || error,
      });
    }
  }
}

module.exports = BookingController;