const db = require('../db');

module.exports = {
  // Guest user functions
  async createGuestUser(userData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users 
        (username, email, password, phone_number, last_name, address1, address2, city, zip_code, country) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userData.username,
        userData.email,
        userData.password,
        userData.phoneNumber,
        userData.lastname,
        userData.address1,
        userData.address2,
        userData.city,
        userData.zipCode,
        userData.country
      ];

      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  async findGuestByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  },

  // Owner/Clerk functions
  async createOwnerClerk(userData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO owner_clerk 
        (username, email, password, phone_number, last_name, address1, address2, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        userData.username,
        userData.email,
        userData.password,
        userData.phoneNumber,
        userData.last_name,
        userData.address1,
        userData.address2,
        userData.role || 'clerk'
      ];

      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  },

  async findOwnerClerkByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM owner_clerk WHERE email = ?', [email], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  },

  async checkExistingOwnerClerk(email, username) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM owner_clerk WHERE email = ? OR username = ?',
        [email, username],
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0]);
        }
      );
    });
  }
};