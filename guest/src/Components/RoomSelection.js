import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiDollarSign, FiArrowRight, FiX } from 'react-icons/fi';
import './RoomSelection.css';

function RoomSelection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Date state
  const [checkinDate, setCheckinDate] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');
  const [validationError, setValidationError] = useState('');

  // Modal state
  const [modalRoom, setModalRoom] = useState(null);  // null means modal closed

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllRooms();
  }, []);

  const fetchAllRooms = async () => {
    setLoading(true);
    setError(null);
    setValidationError('');
    try {
      const response = await axios.get('http://localhost:5000/api/customization/customizable');
      setRooms(response.data);
    } catch (err) {
      console.error('Error fetching all customizable rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async (checkin, checkout) => {
    setLoading(true);
    setError(null);
    setValidationError('');
    try {
      const url = `http://localhost:5000/api/customizationbooking/available-customizable-rooms?checkin_date=${encodeURIComponent(checkin)}&checkout_date=${encodeURIComponent(checkout)}`;
      const response = await axios.get(url);
      setRooms(response.data);
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setError('Failed to load rooms for selected dates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = (roomId) => {
    navigate(`/room-customization/${roomId}`);
  };

  const validateDates = (checkin, checkout) => {
    if (!checkin || !checkout) {
      setValidationError('');
      return false;
    }
    const checkinDateObj = new Date(checkin);
    const checkoutDateObj = new Date(checkout);

    if (checkoutDateObj <= checkinDateObj) {
      setValidationError('Check-out date must be after check-in date.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleCheckinChange = (e) => {
    const newCheckin = e.target.value;
    setCheckinDate(newCheckin);

    if (checkoutDate && new Date(checkoutDate) <= new Date(newCheckin)) {
      setCheckoutDate('');
      setValidationError('Check-out date must be after check-in date.');
    } else {
      validateDates(newCheckin, checkoutDate);
    }
  };

  const handleCheckoutChange = (e) => {
    const newCheckout = e.target.value;
    setCheckoutDate(newCheckout);
    validateDates(checkinDate, newCheckout);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!checkinDate || !checkoutDate) {
      setValidationError('Please select both check-in and check-out dates.');
      return;
    }
    if (!validateDates(checkinDate, checkoutDate)) {
      return;
    }
    fetchAvailableRooms(checkinDate, checkoutDate);
  };

  const handleReset = () => {
    setCheckinDate('');
    setCheckoutDate('');
    setValidationError('');
    setError(null);
    fetchAllRooms();
  };

  // Modal handlers
  const openModal = (room) => {
    setModalRoom(room);
  };

  const closeModal = () => {
    setModalRoom(null);
  };

  // Simple slider inside modal
  const [sliderIndex, setSliderIndex] = useState(0);

  const nextSlide = () => {
    if (!modalRoom) return;
    setSliderIndex((prev) => (prev + 1) % modalRoom.images.length);
  };

  const prevSlide = () => {
    if (!modalRoom) return;
    setSliderIndex((prev) => (prev - 1 + modalRoom.images.length) % modalRoom.images.length);
  };

  return (
    <div className="room-selection-container">
      <header className="room-selection-header">
        <h1>Our Available Customizable Rooms</h1>
        <p className="subtitle">Select your dates and find rooms to customize your perfect stay</p>
      </header>

      <form onSubmit={handleSearch} className="date-picker-form" noValidate>
        <label>
          Check-in:
          <input
            type="date"
            value={checkinDate}
            onChange={handleCheckinChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </label>
        <label>
          Check-out:
          <input
            type="date"
            value={checkoutDate}
            onChange={handleCheckoutChange}
            required
            min={checkinDate || new Date().toISOString().split('T')[0]}
            disabled={!checkinDate}
          />
        </label>

        <button type="submit" disabled={loading || !!validationError}>
          Search Available Rooms
        </button>
        <button type="button" onClick={handleReset} disabled={loading} className="reset-buttont">
          Reset
        </button>
      </form>

      {validationError && (
        <div className="validation-error">
          <p>{validationError}</p>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading rooms...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button
            onClick={() => {
              if (checkinDate && checkoutDate) {
                fetchAvailableRooms(checkinDate, checkoutDate);
              } else {
                fetchAllRooms();
              }
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms available for the selected dates.</p>
      )}

      <div className="rooms-list">
        {rooms.map(room => {
          // Prepare images array for slider modal, fallback if images missing
          const images = [
            room.imageurl1,
            room.imageurl2 || room.imageurl1, // fallback to imageurl1 if no imageurl2
          ].map(img => `http://localhost:5000${img}`);

          return (
            <div key={room.room_id} className="room-card-wide">
              <div className="room-image-container-wide">
                <img 
                  src={`http://localhost:5000${room.imageurl1}`} 
                  alt={room.name} 
                  className="room-image-wide"
                />
                {/* Popular badge as a button */}
                <button
                  className="room-badge-widel"
                  onClick={() => openModal({ ...room, images })}
                >
                  Popular
                </button>
              </div>

              <div className="room-details-wide">
                <div className="room-info-wide">
                  <h3>{room.name}</h3>
                  <div className="room-features-wide">
                    <span><FiStar /> {room.rating || '4.5'}</span>
                    <span><FiDollarSign /> ${room.rentperday}/night</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleCustomize(room.room_id)}
                  className="customize-button-wide"
                >
                  Customize <FiArrowRight />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalRoom && (
        <div className="modal-overlayl" onClick={closeModal}>
          <div className="modal-contentl" onClick={e => e.stopPropagation()}>
            <span onClick={closeModal} style={{ cursor: 'pointer', fontSize: '40px', fontWeight: 'bold',position: 'relative ', left: '530px',top: '-10px' }}>
  ×
</span>

            <h2>{modalRoom.name}</h2>
            {/* Slider */}
            <div className="slider-containerl">
            <span className="slider-arrowl prev-btnl" onClick={prevSlide}>&lt;</span>

              <img src={modalRoom.images[sliderIndex]} alt={`${modalRoom.name} slide`} className="slider-imagel" />
             

             <span className="slider-arrowl next-btnl" onClick={nextSlide}>&gt;</span>

            </div>

            {/* Additional room details */}
            <p className='rty'><strong>Room type:</strong> {modalRoom.room_type} </p>
            <p className='rty'><strong >Price:</strong> ${modalRoom.rentperday}/night</p>
            
            {/* If you have description or other data, add here */}
            {modalRoom.description && <p><strong>Description:</strong> {modalRoom.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomSelection;
