import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './RoomBookings.css'; // Import CSS file

const RoomBookings = () => {
    const { roomId } = useParams();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/bookings/room/${roomId}`)
            .then(response => setBookings(response.data))
            .catch(error => console.error('Error fetching bookings:', error));
    }, [roomId]);

    return (
        <div className="container">
            <h1>Booking Details for Room {roomId}</h1>
            {bookings.length > 0 ? (
                <ul className="bookings-list">
                    {bookings.map((booking) => (
                        <li key={booking.booking_id} className="booking-card">
                            <p><strong>Guest Name:</strong> <span className="highlight">{booking.username}</span></p>
                            <p><strong>Email:</strong> {booking.email}</p>
                            <p><strong>Address:</strong> {booking.address}</p>
                            <p><strong>Check-in Date:</strong> {new Date(booking.checkin_date).toLocaleString()}</p>
                            <p><strong>Check-out Date:</strong> {new Date(booking.checkout_date).toLocaleString()}</p>
                            <p><strong>Payment Status:</strong> {booking.status}</p>
                            <p><strong>Payment Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>
                            <p><strong>Payment Amount:</strong> <span className="highlight">${booking.amount}</span></p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings found for this room.</p>
            )}
        </div>
    );
};

export default RoomBookings;
