import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RoomReviews.css';
import { FiStar, FiMessageSquare, FiHome } from 'react-icons/fi';

const RoomReview = () => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/room/reviews');
        setRoomData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load room reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomReviews();
  }, []);

  if (loading) {
    return (
      <div className="room-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Loading room reviews...</p>
      </div>
    );
  }

  if (error) {
    return <div className="room-reviews-error">{error}</div>;
  }

  return (
    <div className="room-reviews-container">
      <div className="room-reviews-header">
        <h2>Room Reviews</h2>
        <p className="room-reviews-subtitle">See what guests are saying about our accommodations</p>
      </div>

      {!roomData || roomData.length === 0 ? (
        <div className="room-reviews-empty">
          <FiHome size={48} />
          <p>No rooms found or no reviews available.</p>
        </div>
      ) : (
        <div className="room-reviews-grid">
          {roomData.map((room) => (
            <div key={room.room_id} className="room-review-card">
              <div className="room-review-card-header">
                <FiHome className="room-icon" />
                <h3>{room.room_name}</h3>
              </div>
              
              <div className="room-review-card-body">
                <div className="room-rating-container">
                  <FiStar className="rating-icon" />
                  <span className="room-rating-text">
                    Average Rating: {isNaN(Number(room.average_rating)) || room.average_rating === null
                      ? 'Not rated yet'
                      : `${Number(room.average_rating).toFixed(1)}/5`}
                  </span>
                </div>

                <div className="room-reviews-section">
                  <h4 className="room-reviews-title">
                    <FiMessageSquare className="message-icon" />
                    Guest Reviews
                  </h4>
                  
                  {room.comments ? (
                    <ul className="room-comments-list">
                      {room.comments.split(',').map((comment, index) => (
                        <li key={index} className="room-comment-item">
                          {comment.trim()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="room-no-comments">No reviews yet for this room</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomReview;