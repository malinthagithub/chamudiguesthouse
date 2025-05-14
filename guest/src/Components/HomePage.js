import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HomePage.css';
import aboutImage from '../images/about.jpg';
import Homeimage from '../images/home.jpg';
import { FaSearch,FaTimes } from 'react-icons/fa';
import { FaStar ,FaStarHalfAlt } from 'react-icons/fa';
import Box from './Box'; // Assuming Box.js is in the same directory as HomePage.js


// Search Component
const Search = ({ onResults }) => {
    const [roomType, setRoomType] = useState('');
    const [minPrice, setMinPrice] = useState('');
    
const [maxPrice, setMaxPrice] = useState(500);


    const handleRoomTypeSearch = async () => {
        const params = { room_type: roomType };

        try {
            const response = await axios.get('http://localhost:5000/api/search', { params });
            onResults(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };
const handlePriceRangeSearch = async () => {
    const params = { min_price: minPrice, max_price: maxPrice };

    try {
        const response = await axios.get('http://localhost:5000/api/search', { params });
        onResults(response.data);
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
};
const handleResetSearch = async () => {
    setMinPrice('');
    setMaxPrice('');

    try {
        const response = await axios.get('http://localhost:5000/api/search');
        onResults(response.data);
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
};


    const handleMinPriceSearch = async () => {
        const params = { min_price: minPrice };

        try {
            const response = await axios.get('http://localhost:5000/api/search', { params });
            onResults(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    return (
        <div className="search-container">
            <h3>Search Rooms</h3>
            <div className="search-bar">
                <div className="search-left">
                    <div className="input-with-icon">
                        <input
                            type="text"
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            placeholder="Room Type:"
                        />
                        <FaSearch onClick={handleRoomTypeSearch} className="search-icon" />
                    </div>
                </div>
                <div className="search-right">
                    <div className="slider-container">
    <label>Price Range: ${minPrice} - ${maxPrice}</label>
    <input
        type="range"
        min="0"
        max="1000"
        step="10"
        value={minPrice}
        onChange={(e) => setMinPrice(Number(e.target.value))}
    />
    <input
        type="range"
        min="0"
        max="1000"
        step="10"
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
    />
     <FaSearch onClick={handlePriceRangeSearch} className="search-icon1" />
    
    <FaTimes onClick={handleResetSearch} className="reset-button" /> 
</div>

                </div>
            </div>
        </div>
    );
};

// HomePage Component
const HomePage = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [ratings, setRatings] = useState({});
    const navigate = useNavigate();
    const [isBoxOpen, setIsBoxOpen] = useState(false); // State for showing Box
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    // Fetch all rooms initially
    useEffect(() => {
        axios.get('http://localhost:5000/api/rooms/all')
            .then(response => setRooms(response.data))
            .catch(error => console.error('Error fetching rooms:', error));
    }, []);

    // Handle search results and update rooms
    const handleSearchResults = (filteredRooms) => {
        setRooms(filteredRooms);
    };

    const openModal = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRoom(null);
        setIsModalOpen(false);
    };
    const openReviewBox = (roomId) => {
        setSelectedRoomId(roomId);
    };

    const closeReviewBox = () => {
        setSelectedRoomId(null);
    };
// Fetch reviews for each room and set the average rating
useEffect(() => {
    const fetchRatings = async () => {
        const updatedRatings = {};

        for (const room of rooms) {
            const averageRating = await fetchRoomReviews(room.room_id);
            updatedRatings[room.room_id] = averageRating;
        }

        setRatings(updatedRatings); // Store the ratings
    };

    if (rooms.length > 0) {
        fetchRatings(); // Fetch ratings when rooms are available
    }
}, [rooms]); // Re-run this effect when rooms data changes

    // Fetch reviews for a particular room and calculate average rating
    const fetchRoomReviews = async (roomId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/reviews/${roomId}`);
            const reviews = response.data;

            if (reviews.length > 0) {
                const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
                const averageRating = totalRating / reviews.length;
                return averageRating;
            } else {
                return 0; // No reviews, so return a default rating
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return 0; // Return 0 in case of an error
        }
    };

    const handleBookNow = async (room) => {
        if (!checkInDate || !checkOutDate) {
            openModal('Date Selection Required', 'Please select both check-in and check-out dates.');
            return;
        }
        
        // Modal implementation
        function openModal(title, message) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <button class="modal-close">OK</button>
                </div>
            `;
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
            });
            document.body.appendChild(modal);
        }

        const formattedCheckInDate = checkInDate.toLocaleDateString('en-CA');
        const formattedCheckOutDate = checkOutDate.toLocaleDateString('en-CA');

        try {
            const response = await axios.get('http://localhost:5000/api/available/isAvailable', {
                params: {
                    room_id: room.room_id,
                    checkInDate: formattedCheckInDate,
                    checkOutDate: formattedCheckOutDate
                }
            });

            if (response.data.isAvailable) {
                navigate('/booking', {
                    state: {
                        room,
                        checkInDate: formattedCheckInDate,
                        checkOutDate: formattedCheckOutDate,
                    },
                });
            } else {
                showDateConflictMessage();
            }
            
            function showDateConflictMessage() {
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
            
                modal.querySelector('.modal-close').addEventListener('click', () => {
                    modal.remove();
                });
            
                document.body.appendChild(modal);
            }
            
        } catch (error) {
            console.error('Error checking availability:', error);
            alert('Something went wrong. Please try again.');
        }
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        autoplay: false,
        arrows: true,
        swipe: true,
        draggable: true,
        prevArrow: (
            <button 
                className="slick-prev"
                style={{
                    backgroundColor: 'black',
                    border: 'none',
                    fontSize: '30px',
                    color: 'white',
                    padding: '10px',
                    fontWeight: 'bold'
                }}
            >
                &lt;
            </button>
        ),
        nextArrow: (
            <button
                className="slick-next"
                style={{
                    backgroundColor: 'black',
                    border: 'none',
                    fontSize: '30px',
                    color: 'white',
                    padding: '10px',
                    fontWeight: 'bold'
                }}
            >
                &gt;
            </button>
        ),
    };

    return (
        <div className="homepage">
            {/* Date Picker Section */}
            <div className="card-container">
                <div className="homimages">
                    <img
                        src={Homeimage}
                        alt="Chamudi Guest House and Restaurant"
                        className="hotel-image"
                    />
                </div>
            </div>
            

            {/* Search Bar Component */}
            <Search onResults={handleSearchResults} />

            <div className="date-picker-container">
                <div className="date-picker">
                    <label>Check-in Date:</label>
                    <DatePicker 
                        selected={checkInDate} 
                        onChange={(date) => {
                            setCheckInDate(date);
                            if (date && checkOutDate && date > checkOutDate) {
                                setCheckOutDate(null);  // Reset if check-in is after check-out
                            }
                        }}
                        selectsStart
                        startDate={checkInDate}
                        endDate={checkOutDate}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker-input"
                        placeholderText="Select check-in date"
                        minDate={new Date()}
                    />
                </div>
                <div className="date-picker">
                    <label>Check-out Date:</label>
                    <DatePicker 
                        selected={checkOutDate} 
                        onChange={(date) => setCheckOutDate(date)} 
                        selectsEnd
                        startDate={checkInDate}
                        endDate={checkOutDate}
                        dateFormat="yyyy-MM-dd"
                        className="date-picker-input"
                        placeholderText="Select check-out date"
                        minDate={checkInDate || new Date()}
                    />
                </div>
            </div>
            

            {/* Room Listing */}
            <div className="room-container">
                {rooms.map((room) => (
                    <div className="room-card" key={room.room_id}>
                        <img src={`http://localhost:5000${room.imageurl1}`} alt={room.name} />
                        <div className="room-info">
                            <h3>{room.name}</h3>
                            <p>Max Guests: {room.maxcount}</p>
                            <p>Rent: <strong>{room.rentperday} / night</strong></p>
                            {/* Display Average Rating */}
                            <div className="room-rating">
    <div className="rating-stars">
        {/* Displaying the stars */}
        {[...Array(5)].map((_, index) => {
            const rating = ratings[room.room_id] || 0; // Get the rating or 0 if undefined
            if (index < Math.floor(rating)) {
                // Full star for the integer part
                return <FaStar key={index} style={{ color: 'gold', fontSize: '18px' }} />;
            } else if (index < Math.ceil(rating) && rating % 1 !== 0) {
                // Half star for decimal part
                return <FaStarHalfAlt key={index} style={{ color: 'gold', fontSize: '18px' }} />;
            } else {
                // Empty star
                return <FaStar key={index} style={{ color: 'gray', fontSize: '18px' }} />;
            }
        })}
        <span>{ratings[room.room_id]?.toFixed(1)}</span> {/* Display the rating */}
    </div>
</div>

                            <button className="book-btn" onClick={() => handleBookNow(room)}>
                                Book Now
                            </button>
                            <button className="view-btn" onClick={() => openModal(room)}>
                                View
                            </button>
                            {/* New button to show box */}
                            <button onClick={() => openReviewBox(room.room_id)}>
                        Show Reviews
                    </button>
                        </div>
                    </div>
                ))}
                 {selectedRoomId && <Box roomId={selectedRoomId} onClose={closeReviewBox} />}
            )
            </div>

            {/* Modal for Room Images */}
            {isModalOpen && selectedRoom && (
                <div  className="modal-overlay" onClick={closeModal}>
                    <div style={{position:"relative",top:"20px",left:"20px",}} className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-btn" onClick={closeModal}>✖</span>
                        <h2>{selectedRoom.name}</h2>
                        
                        <Slider {...sliderSettings}>
  {/* First image with description */}
  {selectedRoom.imageurl1 && (
    <div className="first-slide-with-description">
      <img 
        src={`http://localhost:5000${selectedRoom.imageurl1}`} 
        alt={selectedRoom.name} 
      />
      {selectedRoom.description && (
        <div className="image-description">
          <p>{selectedRoom.description}</p>
        </div>
      )}
    </div>
  )}

  {/* Other images without description */}
  {selectedRoom.imageurl2 && (
    <div>
      <img src={`http://localhost:5000${selectedRoom.imageurl2}`} alt={selectedRoom.name} />
    </div>
  )}
  
  {selectedRoom.imageurl3 && (
    <div>
      <img src={`http://localhost:5000${selectedRoom.imageurl3}`} alt={selectedRoom.name} />
    </div>
  )}
</Slider>
                    </div>
                </div>
            )}
             {/* Box Component */}
             {isBoxOpen && <Box onClose={toggleBox} />}
        </div>
        
    );
};

export default HomePage;
