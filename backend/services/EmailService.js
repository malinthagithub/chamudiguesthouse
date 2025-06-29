const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendBookingConfirmation(email, bookingDetails) {
    const { room_id, checkin_date, checkout_date, total_amount, discount, newPoints } = bookingDetails;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation",
      text: `Dear user, your booking has been confirmed!

Room ID: ${room_id}
Check-in Date: ${checkin_date}
Check-out Date: ${checkout_date}
Total Amount: $${total_amount.toFixed(2)}
Discount Applied: $${discount.toFixed(2)}

Payment Status: Completed

Loyalty Points Earned: 10
Total Loyalty Points: ${newPoints}

Thank you for booking with us!`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;