const db = require("../db");

class BookingModel {
  static async createBooking(user_id, room_id, checkin_date, checkout_date, total_amount) {
    const [result] = await db.promise().query(
      `INSERT INTO bookings (user_id, room_id, checkin_date, checkout_date, total_amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'confirmed', NOW(), NOW())`,
      [user_id, room_id, checkin_date, checkout_date, total_amount]
    );
    return result.insertId;
  }

  static async getUserLoyaltyPoints(user_id) {
    const [result] = await db.promise().query(
      `SELECT loyalty_points FROM users WHERE id = ?`,
      [user_id]
    );
    return result[0]?.loyalty_points || 0;
  }

  static async updateLoyaltyPoints(user_id, points) {
    await db.promise().query(
      `UPDATE users SET loyalty_points = ? WHERE id = ?`,
      [points, user_id]
    );
  }

  static async getUserEmail(user_id) {
    const [result] = await db.promise().query(
      `SELECT email FROM users WHERE id = ?`,
      [user_id]
    );
    return result[0]?.email;
  }
}

module.exports = BookingModel;