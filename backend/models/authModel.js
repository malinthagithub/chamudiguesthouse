const db = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  // Password reset functions
  async findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  },

  async setResetToken(email, token, expires) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?',
        [token, expires, email],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  },

  async findUserByResetToken(token) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE reset_token = ?', [token], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  },

  async updatePassword(email, hashedPassword) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?',
        [hashedPassword, email],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  },

  // Authentication functions
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },

  async comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};