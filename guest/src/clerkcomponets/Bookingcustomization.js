import React, { useEffect, useState } from 'react';

export default function BookingCustomizations() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(''); // <-- start with no filter
  const [loading, setLoading] = useState(false);

  const fetchData = async (filter) => {
    setLoading(true);
    // Add filter param only if filter is set
    const url = filter
      ? `http://localhost:5000/api/customizationbooking/room-customizations?filter=${filter}`
      : `http://localhost:5000/api/customizationbooking/room-customizations`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Room Bookings & Customizations</h1>

      <div style={{ marginBottom: 15 }}>
        <button onClick={() => setFilter('')} disabled={filter === ''}>All Bookings</button>
        <button onClick={() => setFilter('today')} disabled={filter === 'today'} style={{ marginLeft: 10 }}>Today</button>
        <button onClick={() => setFilter('this_week')} disabled={filter === 'this_week'} style={{ marginLeft: 10 }}>This Week</button>
        <button onClick={() => setFilter('this_month')} disabled={filter === 'this_month'} style={{ marginLeft: 10 }}>This Month</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#eee' }}>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room Name</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Total Amount</th>
              <th>Customization Details</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bookings found</td></tr>
            ) : (
              data.map(b => (
                <tr key={b.booking_id}>
                  <td>{b.booking_id}</td>
                  <td>{b.guest_name}</td>
                  <td>{b.room_name}</td>
                  <td>{new Date(b.checkin_date).toLocaleDateString()}</td>
                  <td>{new Date(b.checkout_date).toLocaleDateString()}</td>
                  <td>${parseFloat(b.total_amount).toFixed(2)}</td>
                  <td>
                    Beds: {b.beds}, AC: {b.ac ? 'Yes' : 'No'}, WiFi: {b.wifi ? 'Yes' : 'No'}, Breakfast: {b.breakfast ? 'Yes' : 'No'},<br />
                    View: {b.view}, Customization Price: ${parseFloat(b.customization_price).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
