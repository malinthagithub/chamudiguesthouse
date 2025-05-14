import React, { useState, useEffect } from 'react';
import './TodayBookings.css'; // Assuming you have a CSS file for styling
const TodayBookings = () => {
  const [todayBookings, setTodayBookings] = useState([]);
  const [weekBookings, setWeekBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Function to fetch fresh bookings from DB
  const fetchBookings = () => {
    fetch('http://localhost:5000/api/booktody/today-and-week-bookings')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched bookings:', data); // Debugging
        setTodayBookings(data.todayBookings || []);
        setWeekBookings(data.weekBookings || []);
      })
      .catch((error) => console.error('Error fetching bookings:', error));
  };

  // Load bookings on first render
  useEffect(() => {
    fetchBookings();
  }, []);

  const handleMarkArrival = (bookingId) => {
    if (!bookingId) {
      console.error('❌ Booking ID is undefined!');
      return;
    }

    setLoading(true);

    // Find the booking in todayBookings list
    const booking = todayBookings.find((b) => b.booking_id === bookingId);

    if (!booking) {
      console.error('❌ Booking not found for ID:', bookingId);
      setLoading(false);
      return;
    }

    // Toggle status logic
    let newStatus;
    if (booking.status?.toLowerCase() === 'arrived') {
      newStatus = 'cancelled'; // or 'confirmed' based on your business logic
    } else {
      newStatus = 'arrived';
    }

    // Send PUT request to backend
    fetch(`http://localhost:5000/api/bookings/update-booking-status/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Status updated successfully:', data);

        if (data.success) {
          // Update the status locally without refetching
          setTodayBookings((prevBookings) =>
            prevBookings.map((b) =>
              b.booking_id === bookingId ? { ...b, status: newStatus } : b
            )
          );
        } else {
          console.error('❌ Error from backend:', data.error);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error updating booking status:', error);
        setLoading(false);
      });
  };

  return (
    <div className="today-bookings">
      {loading && <p style={{ color: 'green' }}>Updating booking status...</p>}

      {/* Today's Bookings */}
      <h2>Today's Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Room</th>
            <th>Check-in Date</th>
            <th>Check-out Date</th>
            <th>Payment Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {todayBookings.length > 0 ? (
            todayBookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.username}</td>
                <td>{booking.room_name}</td>
                <td>{new Date(booking.checkin_date).toLocaleDateString()}</td>
                <td>{new Date(booking.checkout_date).toLocaleDateString()}</td>
                <td>{booking.payment_amount}</td>
                <td>{booking.status || 'Not Arrived'}</td>
                <td>
                  {/* Mark as Arrived or Cancelled */}
                  {booking.status?.toLowerCase() !== 'arrived' && booking.status?.toLowerCase() !== 'cancelled' && (
                    <button
                      onClick={() => handleMarkArrival(booking.booking_id)}
                      className={`mark-arrival-btn ${
                        booking.status?.toLowerCase() === 'arrived' ? 'arrived' : 'not-arrived'
                      }`}
                      disabled={loading}
                    >
                      Mark as {booking.status?.toLowerCase() === 'arrived' ? 'Cancelled' : 'Arrived'}
                    </button>
                  )}
                  {/* Hide or disable the button after marking */}
                  {(booking.status?.toLowerCase() === 'arrived' || booking.status?.toLowerCase() === 'cancelled') && (
                    <span className="status-completed">Status: {booking.status}</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No bookings for today</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Week's Bookings */}
      <h2>This Week's Bookings</h2>
      <table className="booking-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Room</th>
            <th>Check-in Date</th>
            <th>Check-out Date</th>
            <th>Payment Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {weekBookings.length > 0 ? (
            weekBookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.username}</td>
                <td>{booking.room_name}</td>
                <td>{new Date(booking.checkin_date).toLocaleDateString()}</td>
                <td>{new Date(booking.checkout_date).toLocaleDateString()}</td>
                <td>{booking.payment_amount}</td>
                <td>{booking.status || 'Not Arrived'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No bookings for this week</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TodayBookings;
