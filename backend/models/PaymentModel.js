const db = require("../db");

class PaymentModel {
  static async createPayment(booking_id, amount, transaction_id) {
    await db.promise().query(
      `INSERT INTO payments (booking_id, amount, payment_status, payment_method, transaction_id, payment_date)
       VALUES (?, ?, 'pending', 'card', ?, NOW())`,
      [booking_id, amount, transaction_id]
    );
  }

  static async updatePaymentStatus(transaction_id) {
    await db.promise().query(
      `UPDATE payments SET payment_status = 'completed' WHERE transaction_id = ?`,
      [transaction_id]
    );
  }
}

module.exports = PaymentModel;