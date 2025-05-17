import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import './OwnerRoomDashboard.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const OwnerRoomDashboard = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/rooms/all')
            .then(response => setRooms(response.data))
            .catch(error => console.error('Error fetching rooms:', error));
    }, []);

    const openModal = (room) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedRoom(null);
        setIsModalOpen(false);
    };

    

    const deleteRoom = (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
        axios.delete(`http://localhost:5000/api/rooms/delete/${roomId}`)
            .then((response) => {
                // Show success message
                alert(response.data.message); // "Room deleted successfully"
                // Remove the room from UI
                setRooms(prevRooms => prevRooms.filter(room => room.room_id !== roomId));
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    // Room has future bookings
                    alert(error.response.data.message); // "Room has future bookings and cannot be deleted"
                } else {
                    // Some other error
                    alert('Error deleting room. Please try again later.');
                    console.error('Error:', error);
                }
            });
    }
};

    const updateRoom = (roomId) => {
        navigate(`/update-room/${roomId}`);
    };
    const viewBookings = (roomId) => {
        navigate(`/room-bookings/${roomId}`);
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
        draggable: true
    };

    return (
        <div className="owner-dashboard">
            <h1>Manage Your Rooms</h1>
            <button className="add-room-btn" onClick={() => navigate('/add-room')} 
        aria-label="Add new room" title="Add new room">
</button>
            <div className="room-container">
                {rooms.map((room) => (
                    <div className="room-card" key={room.room_id}>
                        <img src={`http://localhost:5000${room.imageurl1}`} alt={room.name} />
                        <div className="room-info">
                            <h3>{room.name}</h3>
                            <p>Max Guests: {room.maxcount}</p>
                            <p>Rent: <strong>${room.rentperday} / night</strong></p>
                            <button className="view-btn" onClick={() => viewBookings(room.room_id)}>  <i className="fas fa-calendar-alt"></i> View Bookings</button>
                            <button className="update-btn" onClick={() => updateRoom(room.room_id)}>  <i className="fas fa-edit"> </i>Update</button>
                            <button className="delete-btn" onClick={() => deleteRoom(room.room_id)}> <i className="fas fa-trash"></i>Delete</button>
                        </div>
                    </div>
                    
                ))}
            </div>

            {isModalOpen && selectedRoom && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-btn" onClick={closeModal}>&times;</span>
                        <h2>{selectedRoom.name}</h2>
                        <Slider {...sliderSettings}>
                            {selectedRoom.imageurl1 && <div><img src={`http://localhost:5000${selectedRoom.imageurl1}`} alt={selectedRoom.name} /></div>}
                            {selectedRoom.imageurl2 && <div><img src={`http://localhost:5000${selectedRoom.imageurl2}`} alt={selectedRoom.name} /></div>}
                            {selectedRoom.imageurl3 && <div><img src={`http://localhost:5000${selectedRoom.imageurl3}`} alt={selectedRoom.name} /></div>}
                        </Slider>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerRoomDashboard;
