import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './RoomCustomization.css';

// Stripe publishable key
const stripePromise = loadStripe('pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y');

const RoomCustomization = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user_id] = useState(1);  // Fixed user ID for now (could be dynamic based on actual user)
  const [room_id] = useState(2);  // Fixed room ID for now (could be dynamic based on room)
  const [beds, setBeds] = useState(1);
  const [hot_water, setHotWater] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [minibar, setMinibar] = useState(false);
  const [room_service, setRoomService] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [pool_access, setPoolAccess] = useState(false);
  const [view, setView] = useState('default');
  const [checkin, setCheckin] = useState(new Date().toISOString().split('T')[0]);  // Default to today
  const [checkout, setCheckout] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/rooms/${room_id}`)
      .then(response => {
        setRoom(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching room details:', error);
        setLoading(false);
      });
  }, [room_id]);

  // Function to calculate total days
  const calculateTotalDays = () => {
    if (!checkin || !checkout) return 1;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Calculate total cost based on selected options
  const calculateTotalAmount = () => {
    let price = room ? room.rentperday : 100;
    if (beds > 1) price += (beds - 1) * 200;
    if (hot_water) price += 1000;
    if (wifi) price += 5;
    if (ac) price += 15;
    if (minibar) price += 10;
    if (room_service) price += 20;
    if (breakfast) price += 15;
    if (pool_access) price += 25;
    if (view === 'sea') price += 30;
    return price * calculateTotalDays();
  };

  const totalAmount = calculateTotalAmount();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Ensure checkin and checkout dates are not empty
    if (!checkin || !checkout) {
      alert('Please select both check-in and check-out dates.');
      setIsProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    const paymentMethod = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    // Debug: Log payment method details
    console.log('Payment Method:', paymentMethod);

    if (paymentMethod.error) {
      alert(paymentMethod.error.message);
      setIsProcessing(false);
      return;
    }

    const customizationData = {
      user_id,
      room_id,
      beds,
      hot_water,
      wifi,
      ac,
      minibar,
      room_service,
      breakfast,
      pool_access,
      view,
      checkin_date: checkin,  // Ensure check-in date is passed correctly
      checkout_date: checkout,  // Ensure check-out date is passed correctly
      total_amount: totalAmount,
      payment_method_id: paymentMethod.paymentMethod.id,
    };

    // Debug: Log the customization data being sent to the backend
    console.log('Customization Data:', customizationData);

    try {
      const response = await axios.post('http://localhost:5000/api/customization/customize', customizationData);
      
      // Debug: Log server response
      console.log('Server Response:', response);

      if (response.status === 200) {
        alert('Room customization and payment successful!');
      } else {
        alert('Customization failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing customization:', error);
      // Debug: Log error response
      if (error.response) {
        console.error('Server error response:', error.response.data);
      }
      alert('Error processing customization or payment.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="room-customization">
      <h2>Customize Your Room</h2>

      {loading ? (
        <p>Loading room details...</p>
      ) : room ? (
        <>
          <h3 style={{ color: 'white', position: 'relative', top: '130px', left: '10px' }}>
            {room.name}
          </h3>
          <img src={`http://localhost:5000${room.imageurl1}`} alt="Room" />
          <p className="price" style={{ color: 'white', position: 'relative', top: '400px', left: '-240px' }}>
            Base Price: ${room.rentperday} per day
          </p>

          <form onSubmit={handleSubmit}>
            <label className="check">
              Check-in Date:
              <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </label>
            <br />
            <label className="check">
              Check-out Date:
              <input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
            </label>
            <br />
            <div className="bed">
              <label>
                Beds:
                <input type="number" value={beds} onChange={(e) => setBeds(Number(e.target.value))} min="1" />
              </label>
              <br />
              <label>
                Hot Water:
                <input type="checkbox" checked={hot_water} onChange={() => setHotWater(!hot_water)} />
              </label>
              <br />
              <label>
                WiFi:
                <input type="checkbox" checked={wifi} onChange={() => setWifi(!wifi)} />
              </label>
              <br />
              <label>
                Air Conditioning:
                <input type="checkbox" checked={ac} onChange={() => setAc(!ac)} />
              </label>
              <br />
              <label>
                Minibar:
                <input type="checkbox" checked={minibar} onChange={() => setMinibar(!minibar)} />
              </label>
              <br />
              <div className="service">
                <label>
                  Room Service:
                  <input type="checkbox" checked={room_service} onChange={() => setRoomService(!room_service)} />
                </label>
                <br />
                <label>
                  Breakfast:
                  <input type="checkbox" checked={breakfast} onChange={() => setBreakfast(!breakfast)} />
                </label>
                <br />
                <label>
                  Pool Access:
                  <input type="checkbox" checked={pool_access} onChange={() => setPoolAccess(!pool_access)} />
                </label>
                <br />
                <label>
                  View:
                  <select value={view} onChange={(e) => setView(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="sea">Sea</option>
                  </select>
                </label>
              </div>
            </div>
            <br />
            <div style={{ position: 'relative', top: '-450px', left: '-500px' }}>
              <p><strong>Total Amount: ${totalAmount}</strong></p>

              <CardElement />
              <button type="submit" disabled={isProcessing || !stripe}>
                {isProcessing ? 'Processing...' : 'Pay & Book'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <p>Room not found.</p>
      )}
    </div>
  );
};

const RoomCustomizationWrapper = () => (
  <Elements stripe={stripePromise}>
    <RoomCustomization />
  </Elements>
);

export default RoomCustomizationWrapper;
