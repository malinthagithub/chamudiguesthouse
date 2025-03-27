import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Box.css';

const Box = ({ roomId, onClose }) => {
    const [allReviews, setAllReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [sortBy, setSortBy] = useState('relevant');

    // Fetch reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/reviews/${roomId}`);
                setAllReviews(response.data);
                setFilteredReviews(response.data); // Show all initially
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReviews();
    }, [roomId]);

    // Sort reviews on the client side
    const handleSortChange = (sortOption) => {
        setSortBy(sortOption);
        let sortedReviews = [...allReviews];

        switch (sortOption) {
            case 'highest':
                sortedReviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                sortedReviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'newest':
                sortedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            default:
                sortedReviews = [...allReviews];
        }

        setFilteredReviews(sortedReviews);
    };

    // Function to display stars based on rating
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const emptyStars = 5 - fullStars;
        return (
            <>
                {'★'.repeat(fullStars).split('').map((_, i) => (
                    <span key={`full-${i}`} className="full-star">★</span>
                ))}
                {'☆'.repeat(emptyStars).split('').map((_, i) => (
                    <span key={`empty-${i}`} className="empty-star">☆</span>
                ))}
            </>
        );
    };

    return (
        <div className="box-overlay" onClick={onClose}>
            <div className="box-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-btn" onClick={onClose}>✖</span>
                <h2>Chamudi Guest House</h2>
                <h2>Room Review</h2>

                {/* Sort Options */}
                <div className="sort-options">
                    <label>Sort By:</label>
                    <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                        <option value="relevant">All Reviews</option>
                        <option value="highest">Highest Rating</option>
                        <option value="newest">Newest First</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>

                {/* Display Reviews */}
                {filteredReviews.length === 0 ? (
                    <p>No reviews available for this room.</p>
                ) : (
                    <ul className="reviews-list">
                        {filteredReviews.map((review) => (
                            <li key={review.review_id} className="review-item">
                                <strong>{review.username} ({review.email})</strong>
                                <p>Rating: {renderStars(review.rating)} ({review.rating}/5)</p>
                                <p>{review.comment}</p>
                                <span className="review-date">{review.time_ago}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Box;
