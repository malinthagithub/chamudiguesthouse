import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './WalkinBookings.css';

const WalkinBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState('');
  const [bookingId, setBookingId] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/walkin-bookings';

      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (bookingId) {
        if (parseInt(bookingId) <= 0) {
          alert('Booking ID must be a positive number');
          return;
        }
        params.append('booking_id', bookingId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching walk-in bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingIdChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBookingId(value);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="walkin-container">
      <h2>Walk-in Bookings</h2>

      <div className="booking-filters">
        <div className="filter-group">
          <label htmlFor="booking-date">Filter by Date</label>
          <input
            id="booking-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="booking-id">Booking ID</label>
          <input
            id="booking-id"
            type="text"
            placeholder="Enter booking ID"
            value={bookingId}
            onChange={handleBookingIdChange}
            pattern="\d*"
          />
        </div>
        
        <div className="filter-actions">
          <button className="filter-btn" onClick={fetchBookings}>
            Filtering
          </button>
          <button
            className="reset-btn"
            onClick={() => {
              setDate('');
              setBookingId('');
              fetchBookings();
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">No walk-in bookings found</div>
      ) : (
        <div className="booking-table-container">
          <table className="walkin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th> {/* NEW */}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.name}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.email}</td>
                  <td>{booking.room_id}</td>
                  <td>{new Date(booking.checkin_date).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkout_date).toLocaleDateString()}</td>
                  <td>${parseFloat(booking.total_amount).toFixed(2)}</td>
                  <td className={getStatusClass(booking.status)}>
                    {booking.status || 'Pending'}
                  </td>
                  <td>{booking.payments && booking.payments.length > 0 ? booking.payments[0].payment_method : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WalkinBookings;
