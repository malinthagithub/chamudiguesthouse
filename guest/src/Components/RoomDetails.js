import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick'; // Import the slider library
import './RoomDetails.css';

const RoomDetails = () => {
    const { room_id } = useParams(); // Get the room_id from the URL
    const [room, setRoom] = useState(null);

    useEffect(() => {
        // Fetch the room details based on room_id
        axios.get(`http://localhost:5000/api/rooms/${room_id}`)
            .then(response => setRoom(response.data))
            .catch(error => console.error('Error fetching room details:', error));
    }, [room_id]);

    // Slider settings
    const sliderSettings = {
        dots: true, // Show dots for navigation
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div className="room-details">
            {room ? (
                <>
                    <h1>{room.name}</h1>
                    <Slider {...sliderSettings}>
                        <div>
                            <img src={`http://localhost:5000${room.imageurl1}`} alt={room.name} />
                        </div>
                        <div>
                            <img src={`http://localhost:5000${room.imageurl2}`} alt={room.name} />
                        </div>
                        <div>
                            <img src={`http://localhost:5000${room.imageurl3}`} alt={room.name} />
                        </div>
                    </Slider>
                    <p>Max Guests: {room.maxcount}</p>
                    <p>Rent: ${room.rentperday} / night</p>
                    <p>{room.description}</p> {/* Optional: Add room description */}
                </>
            ) : (
                <p>Loading room details...</p> // Display a loading message while data is fetched
            )}
        </div>
    );
};

export default RoomDetails;
