import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RoomReviews.css';
const RoomReviews = () => {
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch room reviews data on component mount
  useEffect(() => {
    const fetchRoomReviews = async () => {
      try {
        // Make API call to fetch room reviews data
        const response = await axios.get('http://localhost:5000/room/reviews');
        setRoomData(response.data);  // Store the response data in state
      } catch (err) {
        setError('Error fetching room reviews');
      }
    };

    fetchRoomReviews();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!roomData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="room-reviews-container">
      <h2>Room Reviews</h2>
      {roomData.length === 0 ? (
        <p>No rooms found or no reviews available.</p>
      ) : (
        <ul>
          {roomData.map((room) => (
            <li key={room.room_id} className="room-review-item">
              <h3>{room.room_name}</h3>
              <p>
                <strong>Average Rating:</strong>{' '}
                {isNaN(Number(room.average_rating)) || room.average_rating === null
                  ? 'N/A'
                  : Number(room.average_rating).toFixed(2)}
              </p>
              <div>
                <strong>Reviews:</strong>
                <ul>
                  {room.comments ? (
                    room.comments.split(',').map((comment, index) => (
                      <li key={index}>{comment}</li>
                    ))
                  ) : (
                    <p>No comments available.</p>
                  )}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomReviews;
