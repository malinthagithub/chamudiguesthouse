import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiStar, FiCalendar, FiDollarSign, FiUser, FiClock, FiX, FiEdit2 } from "react-icons/fi";
import { FaHotel, FaRegSadTear } from "react-icons/fa";
import "./ConfirmBooking.css";
import { toast } from 'react-toastify';
function ConfirmBooking() {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const userRole = userData?.role;
  const userId = userData?.userId;
  const user = userData?.username;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [commentData, setCommentData] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [cancellationPolicy, setCancellationPolicy] = useState("");

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

  const calculateRefund = (booking) => {
    const bookingDate = new Date(booking.created_at);
    const currentDate = new Date();
    const daysSinceBooking = Math.floor((currentDate - bookingDate) / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat(booking.total_amount);

    let refund = 0;
    let policy = "";

    if (daysSinceBooking <= 3) {
      refund = totalAmount;
      policy = "100% refund (within 3 days of booking)";
    } else if (daysSinceBooking <= 7) {
      refund = totalAmount * 0.5;
      policy = "50% refund (between 3 to 7 days of booking)";
    } else {
      refund = 0;
      policy = "No refund (after 7 days of booking)";
    }

    setRefundAmount(refund.toFixed(2));
    setCancellationPolicy(policy);
  };

  const handleChange = (e, bookingId) => {
    setCommentData({
      ...commentData,
      [bookingId]: {
        ...commentData[bookingId],
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (roomId, bookingId) => {
    if (!commentData[bookingId]?.rating || !commentData[bookingId]?.comment) {
      alert("Please provide both rating and comment.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/reviews/add", {
        id: userId,
        room_id: roomId,
        rating: commentData[bookingId].rating,
        comment: commentData[bookingId].comment,
      });
      alert(response.data.message);
      toggleReviewForm(bookingId);
      setCommentData({
        ...commentData,
        [bookingId]: { rating: 0, comment: "" }
      });
    } catch (error) {
      console.error("Error adding review:", error.response?.data || error.message);
      alert("Failed to add review. Please try again.");
    }
  };

  const toggleReviewForm = (bookingId) => {
    setReviewForms({
      ...reviewForms,
      [bookingId]: !reviewForms[bookingId]
    });

    if (!commentData[bookingId]) {
      setCommentData({
        ...commentData,
        [bookingId]: { rating: 0, comment: "" }
      });
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    calculateRefund(booking);
    setShowCancelModal(true);
  };

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/cancel-booking", {
        user_id: userId,
        booking_id: selectedBooking.booking_id,
        refund_amount: refundAmount
      });
      toast.success(response.data.message);
      setBookings(bookings.filter((booking) => booking.booking_id !== selectedBooking.booking_id));
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
        <h1>Welcome back, {user || "Guest"}!</h1>
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
  {booking.status === 'cancelled' && (
    <>
      <FiDollarSign className="icon" style={{ marginLeft: '10px' }} />
      <span>Refund: ${refundAmount}</span>
    </>
  )}
</div>
                </div>

                <div className="card-actions">
                  {booking.status === "confirmed" && (
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => openCancelModal(booking)}
                    >
                      <FiX /> Cancel
                    </button>
                  )}
                  {booking.status === "Arrived" && (
                    <button
                      className="action-btn review-btn"
                      onClick={() => toggleReviewForm(booking.booking_id)}
                    >
                      <FiEdit2 /> {reviewForms[booking.booking_id] ? "Close Review" : "Leave Review"}
                    </button>
                  )}
                </div>

                {booking.status === "Arrived" && reviewForms[booking.booking_id] && (
                  <div className="review-form">
                    <h4>Share your experience</h4>
                    <div className="rating-input">
                      <label>Rating (1-5):</label>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`star ${star <= (commentData[booking.booking_id]?.rating || 0) ? "filled" : ""}`}
                            onClick={() => setCommentData({
                              ...commentData,
                              [booking.booking_id]: {
                                ...commentData[booking.booking_id],
                                rating: star
                              }
                            })}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="comment-input">
                      <label>Your Review:</label>
                      <textarea
                        name="comment"
                        value={commentData[booking.booking_id]?.comment || ""}
                        onChange={(e) => handleChange(e, booking.booking_id)}
                        placeholder="Share details about your stay..."
                      />
                    </div>
                    <button
                      className="submit-review-btn"
                      onClick={() => handleSubmit(booking.room_id, booking.booking_id)}
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

      {showCancelModal && (
        <>
          <div
            className="cancel-popup-overlay"
            onClick={() => setShowCancelModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />

          <div
            className="cancel-popup"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              zIndex: 1000,
              width: "400px",
              maxWidth: "90%",
              textAlign: "center",
            }}
          >
            <h3>Cancel Booking</h3>
            <div style={{ margin: "15px 0", textAlign: "left" }}>
              <p><strong>Room:</strong> {selectedBooking?.room_name}</p>
              <p><strong>Total Paid:</strong> ${selectedBooking?.total_amount}</p>
              <p><strong>Refund Amount:</strong> ${refundAmount}</p>
              <p><strong>Policy Applied:</strong> {cancellationPolicy}</p>
            </div>

            <div style={{ marginBottom: "15px", textAlign: "left" }}>
              <strong>Cancellation Policy:</strong>
              <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                <li>If cancelled within 3 days of payment: 100% refund</li>
                <li>If cancelled between 3 to 7 days: 50% refund</li>
                <li>After 7 days: No refund</li>
                <li>Refunds will be processed within 5–7 business days.</li>
                <li>Contact support for special cancellation requests.</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={handleCancelBooking}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ConfirmBooking;