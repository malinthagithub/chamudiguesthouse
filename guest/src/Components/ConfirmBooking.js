import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import "./ConfirmBooking.css";

function ConfirmBooking() {
    const user = JSON.parse(localStorage.getItem("userData"));
    const userId = user ? user.userId : null;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(null);
    const [commentData, setCommentData] = useState({ rating: 0, comment: "" });

    // State for the cancel confirmation modal
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
                    setError("Failed to fetch bookings.");
                    setLoading(false);
                }
            };
            fetchBookings();
        } else {
            setError("No user logged in.");
            setLoading(false);
        }
    }, [userId]);

    const handleChange = (e) => {
        setCommentData({ ...commentData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (roomId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/reviews/add", {
                id: userId,
                room_id: roomId,
                rating: commentData.rating,
                comment: commentData.comment,
            });
            alert(response.data.message);
            setShowReviewForm(null);
        } catch (error) {
            console.error("Error adding review:", error.response?.data || error.message);
            alert("Failed to add review.");
        }
    };

    // Open cancel confirmation modal
    const openCancelModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setShowCancelModal(true);
    };

    const handleCancelBooking = async () => {
        if (!selectedBookingId) {
            alert("Booking ID is missing.");
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/api/cancel-booking", {
                user_id: userId,
                booking_id: selectedBookingId, // Send booking_id from the frontend
            });
            alert(response.data.message);

            // Refresh bookings after cancellation
            setBookings(bookings.filter((booking) => booking.booking_id !== selectedBookingId)); // Corrected to booking_id
            setShowCancelModal(false);
        } catch (error) {
            console.error("Error cancelling booking:", error.response?.data || error.message);
            alert("Failed to cancel booking.");
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="container">
            <h1>Welcome, {user ? user.username : "User"}</h1>
            <h2>Your Confirmed Bookings</h2>
            {bookings.length > 0 ? (
                <ul>
                    {bookings.map((booking) => (
                        <li key={booking.booking_id} className="booking-card">
                            <p><strong>Room:</strong> {booking.room_name}</p>
                            <p><strong>Check-in:</strong> {booking.checkin_date}</p>
                            <p><strong>Check-out:</strong> {booking.checkout_date}</p>
                            <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
                            <p className="status"><strong>Status:</strong> {booking.status}</p>
                            <p><strong>Username:</strong> {booking.user_name}</p>
                            <p><strong>Payment Created At:</strong> {new Date(booking.created_at).toLocaleString()}</p>

                            {booking.status === "confirmed" && (
                                <button
                                    className="cancel-booking-btn"
                                    onClick={() => openCancelModal(booking.booking_id)} // Corrected to booking_id
                                >
                                    Cancel Booking
                                </button>
                            )}

                            <button
                                className="toggle-review-btn"
                                onClick={() => setShowReviewForm(showReviewForm === booking.room_id ? null : booking.room_id)}
                            >
                                {showReviewForm === booking.room_id ? "Hide Review Form" : "Leave a Review"}
                            </button>

                            {showReviewForm === booking.room_id && (
                                <div className="review-form">
                                    <label>Rating (1-5):
                                        <input
                                            type="number"
                                            name="rating"
                                            value={commentData.rating}
                                            onChange={handleChange}
                                            min="1"
                                            max="5"
                                        />
                                    </label>
                                    <label>Comment:
                                        <textarea
                                            name="comment"
                                            value={commentData.comment}
                                            onChange={handleChange}
                                        />
                                    </label>
                                    <button onClick={() => handleSubmit(booking.room_id)}>Submit Review</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No confirmed bookings found.</p>
            )}

            {/* Cancellation Confirmation Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Cancellation Policy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        - Cancellations within 24 hours of check-in are non-refundable. <br />
                        - A processing fee of 10% may apply. <br />
                        - Once canceled, this booking cannot be restored.
                    </p>
                    <p>Do you still want to cancel this booking?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        No, Keep Booking
                    </Button>
                    <Button variant="danger" onClick={handleCancelBooking}>
                        Yes, Cancel Booking
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ConfirmBooking;
