import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import './RoomSelection.css';

function RoomSelection() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customization/customizable');
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again later.');
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleCustomize = (roomId) => {
    navigate(`/room-customization/${roomId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="room-selection-container">
      <header className="room-selection-header">
        <h1>Our Available Rooms</h1>
        <p className="subtitle">Select a room to customize your perfect stay</p>
      </header>

      <div className="rooms-list">
        {rooms.map(room => (
          <div key={room.room_id} className="room-card-wide">
            <div className="room-image-container-wide">
              <img 
                src={`http://localhost:5000${room.imageurl1}`} 
                alt={room.name} 
                className="room-image-wide"
              />
              <div className="room-badge-wide">Popular</div>
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
        ))}
      </div>
    </div>
  );
}

export default RoomSelection;