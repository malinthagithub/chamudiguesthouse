import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ClerkAvailable.module.css';

const ClerkAvailable = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const navigate = useNavigate();

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const today = getToday();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/rooms/all')
      .then((response) => setAllRooms(response.data))
      .catch((error) => console.error('Error fetching all rooms:', error));
  }, []);

  const searchAvailableRooms = () => {
    if (!checkin || !checkout) {
      alert('Please select check-in and check-out dates.');
      return;
    }

    if (checkin < today || checkout < today) {
      alert('Dates cannot be in the past.');
      return;
    }

    if (checkin >= checkout) {
      alert('Check-out date must be after check-in date.');
      return;
    }

    axios
      .get('http://localhost:5000/api/available-walk', {
        params: { checkin, checkout },
      })
      .then((response) => setAvailableRooms(response.data))
      .catch((error) =>
        console.error('Error fetching available rooms:', error)
      );
  };

  const showDateConflictModal = () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <svg class="conflict-icon" viewBox="0 0 24 24">
          <path fill="#cc0000" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
          10 10 10-4.48 10-10S17.52 2 12 2zm1 
          15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h3>Date Conflict</h3>
        <p>This room is unavailable for your selected dates. Try adjusting your stay period.</p>
        <button class="modal-close">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };

  const handleBook = async (roomId) => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/available-walk',
        { params: { checkin, checkout } }
      );

      const stillAvailable = response.data.find(
        (r) => r.room_id === roomId
      );

      if (stillAvailable) {
        navigate('/walkin-payment', {
          state: { roomId, checkin, checkout },
        });
      } else {
        showDateConflictModal();
      }
    } catch (err) {
      console.error('Error verifying room availability:', err);
      showDateConflictModal();
    }
  };

  const renderRoomCard = (room) => (
    <div key={room.room_id} className={styles.roomCard}>
      <img
        src={`http://localhost:5000${room.imageurl1}`}
        alt={room.name}
        className={styles.roomImage}
      />
      <div className={styles.roomDetails}>
        <h4>{room.name}</h4>
        <p>${room.rentperday} <span>/ night</span></p>
        <button onClick={() => handleBook(room.room_id)}>Book Now</button>
      </div>
    </div>
  );

  return (
    <div className={styles.clerkContainer}>
      <h2>Find Available Rooms</h2>

      <div className={styles.datePickerContainer}>
        <div className={styles.datePickerGroup}>
          <label>Check-in Date</label>
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            min={today}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.datePickerGroup}>
          <label>Check-out Date</label>
          <input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            min={checkin || today}
            className={styles.dateInput}
          />
        </div>

        <button
          onClick={searchAvailableRooms}
          className={styles.searchButton}
        >
          Check Availability
        </button>
      </div>

      <div className={styles.roomsGrid}>
        {availableRooms.length > 0 ? (
          availableRooms.map(renderRoomCard)
        ) : (
          <>
            <p className={styles.note}>
              No rooms available for selected dates. Showing all rooms:
            </p>
            {allRooms.map(renderRoomCard)}
          </>
        )}
      </div>
    </div>
  );
};

export default ClerkAvailable;
