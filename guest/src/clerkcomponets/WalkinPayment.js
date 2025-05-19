import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import './WalkinPayment.css';

const stripePromise = loadStripe('pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y');

const CheckoutForm = ({ roomId, checkin, checkout, guest_walkin_data }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const ownerclerk_id = guest_walkin_data?.ownerclerk_id;

      if (!token || !ownerclerk_id || !guest_walkin_data) {
        Swal.fire("Unauthorized", "Please log in to continue.", "warning");
        setLoading(false);
        return;
      }

      // 1. Create Payment Intent
      const { data } = await axios.post('http://localhost:5000/api/walkin-create-payment-intent', {
        roomId,
        checkin,
        checkout,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const clientSecret = data.clientSecret;

      // 2. Confirm Card Payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        Swal.fire("Payment Failed", error.message, "error");
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Insert/update guest walkin data
        const guestResp = await axios.post('http://localhost:5000/api/guest-walkin', {
          guest_walkin_id: guest_walkin_data?.guest_walkin_id,
          guest_walkin_data: { ...guest_walkin_data, ownerclerk_id },
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const guest_walkin_id = guestResp.data.guest_walkin_id;

        // 4. Insert booking + payment
        const walkinRes = await axios.post('http://localhost:5000/api/walkin-payment', {
          guest_walkin_id,
          roomId,
          checkin,
          checkout,
          payment_method: 'stripe',
          payment_intent_id: paymentIntent.id,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (walkinRes.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Your booking has been confirmed.",
            icon: "success",
            confirmButtonText: "View Bookings",
          }).then(() => navigate("/walk_view"));
        } else {
          Swal.fire("Booking Failed", walkinRes.data.message || "Please try again.", "error");
        }
      }
    } catch (error) {
      console.error('[CheckoutForm] Error:', error);
      Swal.fire("Payment Failed", "An error occurred during payment.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
          hidePostalCode: true,
        }}
      />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const WalkinPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { roomId, checkin, checkout, guest_walkin_data } = location.state || {};
  const [showCardForm, setShowCardForm] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setRoomDetails(data);
      } catch (error) {
        console.error('[WalkinPayment] Error fetching room details:', error);
      }
    };

    if (roomId) fetchRoomDetails();
  }, [roomId, token]);

  const handleCashPayment = async () => {
    try {
    const token = sessionStorage.getItem('token');
      const ownerclerk_id = guest_walkin_data?.ownerclerk_id;
      if (!token || !ownerclerk_id || !guest_walkin_data) {
        Swal.fire("Unauthorized", "Please log in to continue.", "warning");
        return;
      }

      // 1. Insert/update guest walkin data
      const guestResp = await axios.post('http://localhost:5000/api/guest-walkin', {
        guest_walkin_id: guest_walkin_data?.guest_walkin_id,
        guest_walkin_data: { ...guest_walkin_data, ownerclerk_id },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const guest_walkin_id = guestResp.data.guest_walkin_id;

      // 2. Insert booking + payment with payment_method cash
      const walkinRes = await axios.post('http://localhost:5000/api/walkin-payment', {
        guest_walkin_id,
        roomId,
        checkin,
        checkout,
        payment_method: 'cash',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (walkinRes.data.success) {
        Swal.fire({
          title: "Success!",
          text: "Your booking has been confirmed.",
          icon: "success",
          confirmButtonText: "View Bookings",
        }).then(() => navigate("/walk_view"));
      } else {
        Swal.fire("Booking Failed", walkinRes.data.message || "Please try again.", "error");
      }
    } catch (err) {
      console.error('[WalkinPayment] Error:', err);
      Swal.fire("Booking Error", "An error occurred. Please try again.", "error");
    }
  };

  if (!roomId || !checkin || !checkout || !guest_walkin_data) {
    return (
      <div className="walkin-payment">
        <p>Missing booking information. Please start the booking process again.</p>
      </div>
    );
  }

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
                guest_walkin_data={guest_walkin_data}
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
