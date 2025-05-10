import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './RoomBookings.css';

const RoomBookings = () => {
    const { roomId } = useParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/bookings/room/${roomId}`)
            .then(response => {
                setBookings(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching bookings:', error);
                setLoading(false);
            });
    }, [roomId]);

    const getStatusBadge = (status) => {
        const statusMap = {
            'paid': { color: 'bg-green-100 text-green-800', text: 'Paid' },
            'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            'failed': { color: 'bg-red-100 text-red-800', text: 'Failed' }
        };
        const statusInfo = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', text: status };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
        );
    };

    return (
        <div className="room-bookings-container">
            <div className="header-section">
                <h1 className="page-title">Room {roomId} Bookings</h1>
                <p className="page-subtitle">Manage and view all booking details</p>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading bookings...</p>
                </div>
            ) : bookings.length > 0 ? (
                <div className="bookings-grid">
                    {bookings.map((booking) => (
                        <div key={booking.booking_id} className="booking-card">
                            <div className="card-header">
                                <div className="guest-avatar">
                                    {booking.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="guest-info">
                                    <h3 className="guest-name">{booking.username}</h3>
                                    <p className="guest-email">{booking.email}</p>
                                </div>
                                <div className="booking-status">
                                    {getStatusBadge(booking.status)}
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Stay Duration</span>
                                    <span className="info-value">
                                        {new Date(booking.checkin_date).toLocaleDateString()} - {new Date(booking.checkout_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Address</span>
                                    <span className="info-value">{booking.address}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Booked On</span>
                                    <span className="info-value">
                                        {new Date(booking.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="payment-amount">
                                    ${booking.amount}
                                    <span className="payment-label">Total Paid</span>
                                </div>
                                <button className="action-button">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <img src="/images/empty-bookings.svg" alt="No bookings" className="empty-image" />
                    <h3>No Bookings Found</h3>
                    <p>This room hasn't been booked yet.</p>
                </div>
            )}
        </div>
    );
};

export default RoomBookings;