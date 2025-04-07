import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiWifi, FiDroplet, FiWind, FiCoffee, FiSun, FiWatch, FiHome, FiCalendar } from 'react-icons/fi';
import { FaSwimmingPool, FaBed, FaMoneyBillWave } from 'react-icons/fa';
import { IoWaterOutline } from 'react-icons/io5';
import './RoomCustomization.css';

const stripePromise = loadStripe('pk_test_51QwQDmEE05ueOOCKzSNPSRQgBaePuf5CZOibhqOKrcxgw8JGtv5JW7iJWYmzWiRSZ4UvjX3FgNZ8omZS1tDduvFG00P1Xd2j5Y');

const RoomCustomization = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user_id] = useState(1);
  const [room_id] = useState(2);
  const [beds, setBeds] = useState(1);
  const [hot_water, setHotWater] = useState(false);
  const [wifi, setWifi] = useState(false);
  const [ac, setAc] = useState(false);
  const [minibar, setMinibar] = useState(false);
  const [room_service, setRoomService] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [pool_access, setPoolAccess] = useState(false);
  const [view, setView] = useState('default');
  const [checkin, setCheckin] = useState(new Date().toISOString().split('T')[0]);
  const [checkout, setCheckout] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/rooms/${room_id}`);
        setRoom(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room details:', error);
        setError('Failed to load room details. Please try again.');
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [room_id]);

  const calculateTotalDays = () => {
    if (!checkin || !checkout) return 1;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotalAmount = () => {
    if (!room) return 0;
    let price = Number(room.rentperday);
  
    if (beds > 1) price += (Number(beds) - 1) * 200;
    if (hot_water) price += 100;
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

    if (!stripe || !elements) {
      alert('Stripe has not loaded yet. Please wait.');
      return;
    }

    if (!checkin || !checkout) {
      alert('Please select both check-in and check-out dates.');
      return;
    }

    setIsProcessing(true);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        alert(stripeError.message);
        setIsProcessing(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/customization/customize', {
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
        checkin_date: checkin,
        checkout_date: checkout,
        total_amount: totalAmount,
        payment_method_id: paymentMethod.id,
      });

      if (response.status === 200) {
        alert('Booking successful! Thank you for your reservation.');
        // Reset form or redirect here
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing booking:', error);
      alert(error.response?.data?.message || 'An error occurred during booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading room details...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
    </div>
  );

  if (!room) return (
    <div className="not-found-container">
      <p>Room not found.</p>
    </div>
  );

  return (
    <div className="customization-container">
      <div className="customization-header">
        <h1>Customize Your Stay</h1>
        <p className="subtitle">Personalize your room to match your preferences</p>
      </div>

      <div className="customization-content">
        <div className="room-display">
          <div className="room-image-container">
            <img 
              src={`http://localhost:5000${room.imageurl1}`} 
              alt={room.name} 
              className="room-image"
            />
            <div className="room-overlay">
              <h2>{room.name}</h2>
              <p className="base-price">
                <FaMoneyBillWave /> Base Price: ${room.rentperday}/night
              </p>
            </div>
          </div>

          <div className="room-features">
            <h3>Selected Features</h3>
            <ul>
              <li className={hot_water ? 'active' : ''}>
                <IoWaterOutline /> Hot Water {hot_water ? '✓' : '✗'}
              </li>
              <li className={wifi ? 'active' : ''}>
                <FiWifi /> WiFi {wifi ? '✓' : '✗'}
              </li>
              <li className={ac ? 'active' : ''}>
                <FiWind /> Air Conditioning {ac ? '✓' : '✗'}
              </li>
              <li className={minibar ? 'active' : ''}>
                <FiCoffee /> Minibar {minibar ? '✓' : '✗'}
              </li>
              <li className={room_service ? 'active' : ''}>
                <FiWatch /> Room Service {room_service ? '✓' : '✗'}
              </li>
              <li className={breakfast ? 'active' : ''}>
                <FiSun /> Breakfast {breakfast ? '✓' : '✗'}
              </li>
              <li className={pool_access ? 'active' : ''}>
                <FaSwimmingPool /> Pool Access {pool_access ? '✓' : '✗'}
              </li>
              <li>
                <FaBed /> {beds} {beds > 1 ? 'Beds' : 'Bed'}
              </li>
              <li>
                <FiHome /> {view === 'sea' ? 'Sea View' : 'Standard View'}
              </li>
            </ul>
          </div>
        </div>

        <form className="customization-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><FiCalendar /> Booking Dates</h3>
            <div className="date-inputs">
              <div className="input-group">
                <label>Check-in Date</label>
                <input 
                  type="date" 
                  value={checkin} 
                  onChange={(e) => setCheckin(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Check-out Date</label>
                <input 
                  type="date" 
                  value={checkout} 
                  onChange={(e) => setCheckout(e.target.value)} 
                  min={checkin || new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaBed /> Room Configuration</h3>
            <div className="input-group">
              <label style={{ color:"black"
              }}>Number of Beds</label>
              <input 
                type="number" 
                value={beds} 
                onChange={(e) => setBeds(Math.max(1, Number(e.target.value)))} 
                min="1" 
              />
            </div>
            <div className="input-group">
              <label>View Type</label>
              <select value={view} onChange={(e) => setView(e.target.value)}>
                <option value="default">Standard View</option>
                <option value="sea">Sea View (+$30/night)</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={hot_water} 
                  onChange={() => setHotWater(!hot_water)} 
                />
                <span className="checkmark"></span>
                <IoWaterOutline /> Hot Water (+$100)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={wifi} 
                  onChange={() => setWifi(!wifi)} 
                />
                <span className="checkmark"></span>
                <FiWifi /> WiFi (+$5/day)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={ac} 
                  onChange={() => setAc(!ac)} 
                />
                <span className="checkmark"></span>
                <FiWind /> Air Conditioning (+$15/day)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={minibar} 
                  onChange={() => setMinibar(!minibar)} 
                />
                <span className="checkmark"></span>
                <FiCoffee /> Minibar (+$10/day)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={room_service} 
                  onChange={() => setRoomService(!room_service)} 
                />
                <span className="checkmark"></span>
                <FiWatch /> Room Service (+$20/day)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={breakfast} 
                  onChange={() => setBreakfast(!breakfast)} 
                />
                <span className="checkmark"></span>
                <FiSun /> Breakfast (+$15/day)
              </label>
              <label className="checkbox-option">
                <input 
                  type="checkbox" 
                  checked={pool_access} 
                  onChange={() => setPoolAccess(!pool_access)} 
                />
                <span className="checkmark"></span>
                <FaSwimmingPool /> Pool Access (+$25/day)
              </label>
            </div>
          </div>

          <div className="form-section payment-section">
            <h3>Payment Details</h3>
            <div className="total-display">
              <p>Total for {calculateTotalDays()} {calculateTotalDays() > 1 ? 'nights' : 'night'}:</p>
              <p className="total-amount">${totalAmount.toFixed(2)}</p>
            </div>
            
            <div className="card-element-container">
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
              }} />
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                'Confirm Booking & Pay'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoomCustomizationWrapper = () => (
  <Elements stripe={stripePromise}>
    <RoomCustomization />
  </Elements>
);

export default RoomCustomizationWrapper;