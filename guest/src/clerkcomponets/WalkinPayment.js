import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import './WalkinPayment.css';

const stripePromise = loadStripe('pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y');

const CheckoutForm = ({ roomId, checkin, checkout, guest_walkin_id }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    console.log("Submitting payment with:", { roomId, checkin, checkout, guest_walkin_id });

    try {
      const { data } = await axios.post('http://localhost:5000/api/walkin-create-payment-intent', {
        roomId,
        checkin,
        checkout,
        guest_walkin_id,
      });

      console.log("Received clientSecret from backend:", data.clientSecret);

      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        console.error("Stripe payment error:", error);
        Swal.fire("Payment Failed", error.message, "error");
      } else if (paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded, paymentIntent:", paymentIntent);

        // Debug: Show what is being sent in payment confirmation
        const paymentConfirmData = {
          roomId,
          checkin,
          checkout,
          user_id: guest_walkin_id,
          payment_method: 'stripe',
          payment_intent_id: paymentIntent.id,
        };
        console.log("Sending payment confirmation to backend:", paymentConfirmData);

        await axios.post('http://localhost:5000/api/walkin-payment', paymentConfirmData);

        Swal.fire({
          title: "Success!",
          text: "Your booking has been confirmed.",
          icon: "success",
          confirmButtonText: "View Bookings",
        }).then(() => navigate("/walk_view"));
      }
    } catch (error) {
      console.error("Error during payment process:", error);
      Swal.fire("Payment Failed", "An error occurred during payment.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement options={{
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
        hidePostalCode: true
      }} />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay Now`}
      </button>
    </form>
  );
};

const WalkinPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, checkin, checkout, guest_walkin_id } = location.state || {};
  const [showCardForm, setShowCardForm] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        console.log("Fetching room details for roomId:", roomId);
        const { data } = await axios.get(`http://localhost:5000/api/rooms/${roomId}`);
        console.log("Room details fetched:", data);
        setRoomDetails(data);
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    };

    if (roomId) fetchRoomDetails();
  }, [roomId]);

  if (!roomId || !checkin || !checkout || !guest_walkin_id) {
    return <div className="walkin-payment">
      <p>Missing booking information. Please start the booking process again.</p>
    </div>;
  }

  const handleCashPayment = async () => {
    try {
      console.log("Processing cash payment with:", { roomId, checkin, checkout, guest_walkin_id });
      const { data } = await axios.post('http://localhost:5000/api/walkin-payment', {
        roomId,
        checkin,
        checkout,
        guest_walkin_id,
        payment_method: 'cash',
      });
      console.log("Cash payment response:", data);

      if (data.success) {
        Swal.fire({
          title: "Success!",
          text: "Your booking has been confirmed.",
          icon: "success",
          confirmButtonText: "View Bookings",
        }).then(() => navigate("/walk_view"));
      } else {
        Swal.fire("Payment Failed", data.message || "Please try again.", "error");
      }
    } catch (err) {
      console.error("Error during cash payment:", err);
      Swal.fire("Booking Error", "An error occurred. Please try again.", "error");
    }
  };

  return (
    <div className="walkin-payment">
      <h2>Complete Your Booking</h2>
      
      {roomDetails && (
        <div className="room-display">
          <img 
            src={`http://localhost:5000${roomDetails.imageurl1}`} 
            alt={`Room ${roomId}`} 
            className="room-image" 
          />
          <div className="room-details">
            <h3>{roomDetails.name}</h3>
            <p>Room #{roomId}</p>
            <p>${roomDetails.rentperday} per night</p>
          </div>
        </div>
      )}

      <div className="booking-info">
        <p><strong>Check-in:</strong> {new Date(checkin).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> {new Date(checkout).toLocaleDateString()}</p>
        <p><strong>Guest ID:</strong> {guest_walkin_id}</p>
      </div>

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        
        {!showCardForm ? (
          <div className="payment-options">
            <button onClick={() => setShowCardForm(true)}>Pay Online</button>
            <button onClick={handleCashPayment}>Pay at Reception</button>
          </div>
        ) : (
          <>
            <Elements stripe={stripePromise}>
              <CheckoutForm
                roomId={roomId}
                checkin={checkin}
                checkout={checkout}
                guest_walkin_id={guest_walkin_id}
              />
            </Elements>
            <span className="back-button" onClick={() => setShowCardForm(false)}>
              ← Back to payment options
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default WalkinPayment;
