import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StripeCheckout from "react-stripe-checkout";
import "./BookingPage.css";
import Swal from "sweetalert2";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Destructure room and dates from location state
  const { room, checkInDate, checkOutDate } = location.state || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get user data from local storage (assuming user data is stored after login)
  const user = JSON.parse(localStorage.getItem('userData')); // Retrieve userData from localStorage
const userId = user ? user.userId : null; // Extract userId
console.log('User ID:', userId); // This should log the correct user ID after login

  
  let numberOfNights = 0;
  let totalAmount = 0;

  // Calculate the number of nights and total amount
  if (room && checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut - checkIn;
    numberOfNights = timeDifference > 0 ? timeDifference / (1000 * 3600 * 24) : 0;
    totalAmount = numberOfNights * room.rentperday;
  }

  // Handle Stripe Checkout token
  const onToken = async (token) => {
    console.log("Received token from Stripe:", token);

    if (!token || !token.id) {
      alert("Payment method not received. Please try again.");
      return;
    }

    try {
      const totalAmountInCents = totalAmount * 100; // Convert to cents

      // Send the payment method ID and other booking details to the backend
      const response = await fetch("http://localhost:5000/api/stripe/book-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_method_id: token.id,
          total_amount: totalAmountInCents,
          user_id: userId, // Use the user ID from the logged-in user
          room_id: room.room_id, // Room ID
          checkin_date: checkInDate,
          checkout_date: checkOutDate,
        }),
      });

      const data = await response.json(); // Parse response as JSON

      if (response.ok) {
        Swal.fire({
          title: "Payment Successful!",
          text: "Your booking has been confirmed.",
          icon: "success",
          confirmButtonText: "Go to Home",
        }).then(() => navigate("/")); // Redirect after confirmation
      } else {
        Swal.fire({
          title: "Payment Failed!",
          text: data.message || "Unknown error occurred.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
      
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleViewVideo = () => {
    if (room && room.video_url) {
      setIsModalOpen(true);
    } else {
      alert("No video available for this room.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // If no room or dates are provided, display an error message
  if (!room || !checkInDate || !checkOutDate) {
    return <p>No booking details available.</p>;
  }

  return (
    <div className="booking-page">
      <h1>Booking Details</h1>
      <div className="room-details">
        <h2>
          <strong>{room.name}</strong>
        </h2>
        <p>
          <strong>Check-in:</strong> {checkInDate}
        </p>
        <p>
          <strong>Check-out:</strong> {checkOutDate}
        </p>
        <p>
          <strong>Rent per night:</strong> ${room.rentperday}
        </p>
        <p>
          <strong>Max Guests:</strong> {room.maxcount}
        </p>
        <p>
          <strong>Phone Number:</strong> {room.phonenumber}
        </p>

        <div className="room-image">
          <img src={`http://localhost:5000${room.imageurl1}`} alt={room.name} />
        </div>

        <p>
          <strong>Total Nights:</strong> {numberOfNights}
        </p>
        <p>
          <strong>Total Amount:</strong> ${totalAmount.toFixed(2)}
        </p>
      </div>

      <div className="action-buttons">
        {/* Stripe Checkout button */}
        <StripeCheckout
          token={onToken}
          stripeKey="pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y" // Replace with your Stripe publishable key
          amount={totalAmount * 100} // Stripe accepts amount in cents
          name={room.name}
          description={`Booking for ${room.name}`}
          currency="USD"
          panelLabel="Pay Now"
        />
        <button onClick={handleViewVideo}>View Video</button>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="content">
            <button className="close-btn" onClick={closeModal}>
              x
            </button>
            <video controls>
              <source
                src={`http://localhost:5000${room.video_url}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
