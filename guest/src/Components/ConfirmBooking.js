import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FiStar, FiCalendar, FiDollarSign, FiUser, FiClock, FiX, FiEdit2 } from "react-icons/fi";
import { FaHotel, FaRegSadTear } from "react-icons/fa";
import "./ConfirmBooking.css";

function ConfirmBooking() {
    const user = JSON.parse(localStorage.getItem("userData"));
    const userId = user ? user.userId : null;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(null);
    const [commentData, setCommentData] = useState({ rating: 0, comment: "" });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    useEffect(() => {
        if (userId) {
            const fetchBookings = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/bookings/${userId}`);
                    setBookings(response.data);
                    setLoading(false);
                } catch (err) {
                    setError("Failed to fetch bookings. Please try again later.");
                    setLoading(false);
                }
            };
            fetchBookings();
        } else {
            setError("Please login to view your bookings.");
            setLoading(false);
        }
    }, [userId]);

    const handleChange = (e) => {
        setCommentData({ ...commentData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (roomId) => {
        if (!commentData.rating || !commentData.comment) {
            alert("Please provide both rating and comment.");
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/api/reviews/add", {
                id: userId,
                room_id: roomId,
                rating: commentData.rating,
                comment: commentData.comment,
            });
            alert(response.data.message);
            setShowReviewForm(null);
            setCommentData({ rating: 0, comment: "" });
        } catch (error) {
            console.error("Error adding review:", error.response?.data || error.message);
            alert("Failed to add review. Please try again.");
        }
    };

    const openCancelModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setShowCancelModal(true);
    };

    const handleCancelBooking = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/cancel-booking", {
                user_id: userId,
                booking_id: selectedBookingId,
            });
            alert(response.data.message);
            setBookings(bookings.filter((booking) => booking.booking_id !== selectedBookingId));
            setShowCancelModal(false);
        } catch (error) {
            console.error("Error cancelling booking:", error.response?.data || error.message);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <FaRegSadTear className="error-icon" />
            <p className="error-message">{error}</p>
        </div>
    );

    return (
        <div className="booking-container">
            <header className="booking-header">
                <h1>Welcome back, {user ? user.username : "Guest"}!</h1>
                <p className="subtitle">Here are your current bookings</p>
            </header>

            <main className="booking-content">
                {bookings.length > 0 ? (
                    <div className="booking-grid">
                        {bookings.map((booking) => (
                            <div key={booking.booking_id} className="booking-card">
                                <div className="card-header">
                                    <FaHotel className="hotel-icon" />
                                    <h3>{booking.room_name}</h3>
                                    <span className={`status-badge ${booking.status}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="card-details">
                                    <div className="detail-item">
                                        <FiCalendar className="icon" />
                                        <span>Check-in: {new Date(booking.checkin_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiCalendar className="icon" />
                                        <span>Check-out: {new Date(booking.checkout_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiDollarSign className="icon" />
                                        <span>Total: ${booking.total_amount}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiUser className="icon" />
                                        <span>Booked by: {booking.user_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FiClock className="icon" />
                                        <span>Booked on: {new Date(booking.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {booking.status === "confirmed" && (
                                        <button 
                                            className="action-btn cancel-btn"
                                            onClick={() => openCancelModal(booking.booking_id)}
                                        >
                                            <FiX /> Cancel
                                        </button>
                                    )}
                                    <button
                                        className="action-btn review-btn"
                                        onClick={() => setShowReviewForm(showReviewForm === booking.room_id ? null : booking.room_id)}
                                    >
                                        <FiEdit2 /> {showReviewForm === booking.room_id ? "Close Review" : "Leave Review"}
                                    </button>
                                </div>

                                {showReviewForm === booking.room_id && (
                                    <div className="review-form">
                                        <h4>Share your experience</h4>
                                        <div className="rating-input">
                                            <label>Rating (1-5):</label>
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FiStar 
                                                        key={star}
                                                        className={`star ${star <= commentData.rating ? "filled" : ""}`}
                                                        onClick={() => setCommentData({...commentData, rating: star})}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="comment-input">
                                            <label>Your Review:</label>
                                            <textarea
                                                name="comment"
                                                value={commentData.comment}
                                                onChange={handleChange}
                                                placeholder="Share details about your stay..."
                                            />
                                        </div>
                                        <button 
                                            className="submit-review-btn"
                                            onClick={() => handleSubmit(booking.room_id)}
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-bookings">
                        <img src="/images/no-bookings.svg" alt="No bookings" />
                        <h3>No bookings found</h3>
                        <p>You don't have any confirmed bookings yet.</p>
                    </div>
                )}
            </main>

            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header >
                    <Modal.Title>Cancel Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="policy-container">
                        <h5>Cancellation Policy</h5>
                        <ul className="policy-list">
                            <li><span>•</span> Cancellations within 24 hours of check-in are non-refundable</li>
                            <li><span>•</span> 10% processing fee applies to all cancellations</li>
                            <li><span>•</span> Cancelled bookings cannot be restored</li>
                        </ul>
                        <p className="confirmation-text">Are you sure you want to cancel this booking?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowCancelModal(false)}>
                        Keep Booking
                    </Button>
                    <Button variant="danger" onClick={handleCancelBooking}>
                        Confirm Cancellation
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ConfirmBooking;