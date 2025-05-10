import React, { useState, useEffect } from 'react';

const TodayBookings = () => {
  const [todayBookings, setTodayBookings] = useState([]);
  const [weekBookings, setWeekBookings] = useState([]);

  useEffect(() => {
    // Fetch the bookings for today and this week from the backend
    fetch('http://localhost:5000/api/booktody/today-and-week-bookings')
      .then((response) => response.json())
      .then((data) => {
        setTodayBookings(data.todayBookings || []);
        setWeekBookings(data.weekBookings || []);
      })
      .catch((error) => console.error('Error fetching bookings:', error));
  }, []);

  const handleMarkArrival = (bookingId, isToday) => {
    const updatedBookings = isToday
      ? todayBookings.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: booking.status === 'Arrived' ? 'Not Arrived' : 'Arrived' }
            : booking
        )
      : weekBookings.map((booking) =>
          booking.booking_id === bookingId
            ? { ...booking, status: booking.status === 'Arrived' ? 'Not Arrived' : 'Arrived' }
            : booking
        );

    if (isToday) {
      setTodayBookings(updatedBookings);
    } else {
      setWeekBookings(updatedBookings);
    }

    // Send a PUT request to update the status on the server
    fetch(`http://localhost:5000/api/bookings/update-booking-status/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: updatedBookings.find((b) => b.booking_id === bookingId).status,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Status updated successfully:', data);
      })
      .catch((error) => console.error('Error updating booking status:', error));
  };

  return (
    <div className="today-bookings">
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
                  <button
                    onClick={() => handleMarkArrival(booking.booking_id, true)} // Mark today's booking as arrived
                    className={`mark-arrival-btn ${booking.status === 'Arrived' ? 'arrived' : 'not-arrived'}`}
                  >
                    Mark as {booking.status === 'Arrived' ? 'Not Arrived' : 'Arrived'}
                  </button>
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
            <th>Action</th>
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
                <td>
                  <button
                    onClick={() => handleMarkArrival(booking.booking_id, false)} // Mark week's booking as arrived
                    className={`mark-arrival-btn ${booking.status === 'Arrived' ? 'arrived' : 'not-arrived'}`}
                  >
                    Mark as {booking.status === 'Arrived' ? 'Not Arrived' : 'Arrived'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No bookings for this week</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TodayBookings;
