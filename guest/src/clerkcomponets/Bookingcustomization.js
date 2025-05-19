import React, { useEffect, useState } from 'react';
import './BookingCustomizations.css';

export default function BookingCustomizations() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async (filter) => {
    setLoading(true);
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
    <div className="booking-customizations-container">
      <h1 className="booking-customizations-header">Room Bookings & Customizations</h1>

      <div className="booking-filters-container">
        <button 
          className="booking-filter-button" 
          onClick={() => setFilter('')} 
          disabled={filter === ''}
        >
          All Bookings
        </button>
        <button 
          className="booking-filter-button" 
          onClick={() => setFilter('today')} 
          disabled={filter === 'today'}
        >
          Today
        </button>
        <button 
          className="booking-filter-button" 
          onClick={() => setFilter('this_week')} 
          disabled={filter === 'this_week'}
        >
          This Week
        </button>
        <button 
          className="booking-filter-button" 
          onClick={() => setFilter('this_month')} 
          disabled={filter === 'this_month'}
        >
          This Month
        </button>
      </div>

      {loading ? (
        <div className="booking-loading-indicator">Loading...</div>
      ) : (
        <table className="booking-table">
          <thead className="booking-table-header">
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
              <tr>
                <td colSpan="7" className="booking-table-cell-empty">
                  No bookings found
                </td>
              </tr>
            ) : (
              data.map(b => (
                <tr key={b.booking_id} className="booking-table-row">
                  <td className="booking-table-cell">{b.booking_id}</td>
                  <td className="booking-table-cell">{b.guest_name}</td>
                  <td className="booking-table-cell">{b.room_name}</td>
                  <td className="booking-table-cell">
                    {new Date(b.checkin_date).toLocaleDateString()}
                  </td>
                  <td className="booking-table-cell">
                    {new Date(b.checkout_date).toLocaleDateString()}
                  </td>
                  <td className="booking-table-cell">
                    ${parseFloat(b.total_amount).toFixed(2)}
                  </td>
                  <td className="booking-table-cell">
                    <div className="booking-customization-details">
                      <div>Beds: {b.beds}, AC: {b.ac ? 'Yes' : 'No'}, WiFi: {b.wifi ? 'Yes' : 'No'}</div>
                      <div>Breakfast: {b.breakfast ? 'Yes' : 'No'}, View: {b.view}</div>
                      <div>Customization Price: ${parseFloat(b.customization_price).toFixed(2)}</div>
                    </div>
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