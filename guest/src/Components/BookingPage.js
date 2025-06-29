import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StripeCheckout from "react-stripe-checkout";
import "./BookingPage.css";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FiArrowLeft, FiDollarSign, FiCalendar, FiUser, FiPhone, FiVideo } from "react-icons/fi";
import { FaBed } from "react-icons/fa";

/**
 * BookingPage Component
 * Handles room booking process including:
 * - Displaying booking details
 * - Processing Stripe payments
 * - Video tour preview
 */
const BookingPage = () => {
  // Router hooks for navigation and accessing location state
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure room and dates from navigation state
  const { room, checkInDate, checkOutDate } = location.state || {};

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls video modal visibility
  const [isLoading, setIsLoading] = useState(false);     // Loading state during payment processing

  // Get user data from sessionStorage (more secure than localStorage)
  const user = JSON.parse(sessionStorage.getItem('userData'));
  const userId = user ? user.userId : null;
  
  // Calculate booking duration and total cost
  let numberOfNights = 0;
  let totalAmount = 0;

  if (room && checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut - checkIn;
    // Calculate nights (rounding up for partial days)
    numberOfNights = timeDifference > 0 ? Math.ceil(timeDifference / (1000 * 3600 * 24)) : 0;
    const rentPerDay = Number(room.rentperday);
    totalAmount = numberOfNights * rentPerDay;
  }

  /**
   * Handles Stripe payment token
   * @param {Object} token - Stripe payment token
   */
  const onToken = async (token) => {
    setIsLoading(true);
    
    // Validate payment token
    if (!token || !token.id) {
      Swal.fire({
        title: "Payment Error",
        text: "Payment method not received. Please try again.",
        icon: "error"
      });
      setIsLoading(false);
      return;
    }

    try {
      // Convert dollars to cents for Stripe
      const totalAmountInCents = totalAmount;

      // Send booking data to backend
      const response = await fetch("http://localhost:5000/api/book-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_id: token.id,
          total_amount: totalAmountInCents,
          user_id: userId,
          room_id: room.room_id,
          checkin_date: checkInDate,
          checkout_date: checkOutDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message with fun animation
        Swal.fire({
          title: "Success!",
          text: "Your booking has been confirmed.",
          icon: "success",
          confirmButtonText: "View Bookings",
          background: '#f8f9fa',
          backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
          `
        }).then(() => navigate("/confirm"));
      } else {
        // Show payment failure message
        Swal.fire({
          title: "Payment Failed",
          text: data.message || "Please try again.",
          icon: "error"
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        title: "Error",
        text: "An error occurred. Please try again.",
        icon: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Opens video modal if video exists
   */
  const handleViewVideo = () => {
    if (room && room.video_url) {
      setIsModalOpen(true);
    } else {
      Swal.fire({
        title: "No Video",
        text: "No video available for this room.",
        icon: "info"
      });
    }
  };

  // Close video modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Guard clause - redirect if missing booking data
  if (!room || !checkInDate || !checkOutDate) {
    return (
      <div className="booking-error">
        <h2>Booking Details Missing</h2>
        <p>No booking information available. Please start your booking process again.</p>
        <button onClick={() => navigate("/")} className="back-button">
          <FiArrowLeft /> Back to Home
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="booking-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <div className="booking-header">
        <h1>Complete Your Booking</h1>
        <p className="booking-subtitle">Review your reservation details before payment</p>
      </div>

      <div className="booking-layout">
        {/* Left Column - Room Details */}
        <div className="room-details-card">
          <div className="room-image-container">
            <img 
              src={`http://localhost:5000${room.imageurl1}`} 
              alt={room.name} 
              className="room-main-image"
            />
            <div className="room-badge">{room.type}</div>
          </div>

          <div className="room-info">
            <h2>{room.name}</h2>
            <p className="room-description">{room.description}</p>
            
            <div className="room-features-grid">
              <div className="feature-item">
                <FiUser className="feature-icon" />
                <span>Max Guests: {room.maxcount}</span>
              </div>
              <div className="feature-item">
                <FiPhone className="feature-icon" />
                <span>Contact: {room.phonenumber}</span>
              </div>
              <div className="feature-item">
               <FaBed className="feature-icon" />
                <span>Contact: {room.room_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="booking-summary-card">
          <h3 className="summary-title">Booking Summary</h3>
          
          {/* Date Display */}
          <div className="summary-dates">
            <div className="date-item">
              <FiCalendar className="date-icon" />
              <div>
                <p className="date-label">Check-in</p>
                <p className="date-value">
                  {new Date(checkInDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="date-item">
              <FiCalendar className="date-icon" />
              <div>
                <p className="date-label">Check-out</p>
                <p className="date-value">
                  {new Date(checkOutDate).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-item">
              <span>${room.rentperday} x {numberOfNights} nights</span>
              <span>${(room.rentperday * numberOfNights).toFixed(2)}</span>
            </div>
            <div className="price-item">
              <span>Service fee</span>
              <span>Free</span>
            </div>
          </div>

          {/* Total Price */}
          <div className="total-price">
            <span>Total</span>
            <span className="total-amount">${totalAmount.toFixed(2)}</span>
          </div>

          {/* Payment Actions */}
          <div className="payment-actions">
            <StripeCheckout
              token={onToken}
              stripeKey="pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y"
              amount={totalAmount * 100} // Stripe uses cents
              name={room.name}
              description={`${numberOfNights} nights at ${room.name}`}
              currency="USD"
              panelLabel="Pay Now"
            >
              <button className="pay-button" disabled={isLoading}>
                {isLoading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
              </button>
            </StripeCheckout>

            <button onClick={handleViewVideo} className="video-button">
              <FiVideo /> Room Video Tour
            </button>
            
            <button onClick={() => navigate(-1)} className="back-button">
              <FiArrowLeft /> Modify Booking
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <motion.div 
          className="video-modal "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ position:"relative",top:"20px", left:"20px"}} className="modal-content">
            <button  className="btn"onClick={closeModal}>
              &times;
            </button>
            <h3>Video Tour: {room.name}</h3>
            <div className="video-container">
              <video controls autoPlay>
                <source
                  src={`http://localhost:5000${room.video_url}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookingPage;