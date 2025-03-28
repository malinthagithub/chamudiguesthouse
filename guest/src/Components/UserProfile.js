import React, { useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  // Sample user data
  const [user, setUser] = useState({
    username: 'John Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    bookings: [
      { id: 1, hotelName: 'Hotel ABC', checkIn: '2025-04-01', checkOut: '2025-04-07', status: 'Completed' },
      { id: 2, hotelName: 'Hotel XYZ', checkIn: '2025-05-10', checkOut: '2025-05-15', status: 'Pending' },
    ],
    paymentMethods: [
      { cardType: 'Visa', last4: '1234' },
    ],
  });

  // Edit user data
  const handleEdit = (field) => {
    const newValue = prompt(`Enter new value for ${field}:`);
    setUser((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-info">
          <img className="profile-picture" src="https://via.placeholder.com/100" alt="profile" />
          <div className="profile-text">
            <h2>Welcome, {user.username}</h2>
            <p>{user.email}</p>
            <p>{user.phone}</p>
            <button className="edit-btn" onClick={() => handleEdit('username')}>Edit Profile</button>
          </div>
        </div>
        <button className="logout-btn">Logout</button>
      </div>

      <div className="profile-sections">
        <section>
          <h3>Booking History</h3>
          {user.bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <p><strong>{booking.hotelName}</strong></p>
              <p>Check-in: {booking.checkIn}</p>
              <p>Check-out: {booking.checkOut}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </section>

        <section>
          <h3>Payment Methods</h3>
          {user.paymentMethods.map((payment, idx) => (
            <div key={idx} className="payment-card">
              <p>{payment.cardType} ending in {payment.last4}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default UserProfile;
