import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdateRoom.css';

const UpdateRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // State for room details
    const [roomData, setRoomData] = useState({
        name: '',
        maxcount: '',
        phonenumber: '',
        rentperday: '',
        imageFile1: null,
        imageFile2: null,
        imageFile3: null,
        videoFile: null,
    });

    // Fetch room details when component loads
    useEffect(() => {
        axios.get(`http://localhost:5000/api/rooms/${roomId}`)
            .then(response => {
                const room = response.data;
                setRoomData({
                    name: room.name,
                    maxcount: room.maxcount,
                    phonenumber: room.phonenumber,
                    rentperday: room.rentperday,
                    imageFile1: null,
                    imageFile2: null,
                    imageFile3: null,
                    videoFile: null,
                });
            })
            .catch(error => console.error('Error fetching room details:', error));
    }, [roomId]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomData({ ...roomData, [name]: value });
    };

    // Handle file input change (images and video)
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setRoomData({ ...roomData, [name]: files[0] });
    };

    // Handle update submission
    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append('name', roomData.name);
        formData.append('maxcount', roomData.maxcount);
        formData.append('phonenumber', roomData.phonenumber);
        formData.append('rentperday', roomData.rentperday);

        // Append image files
        if (roomData.imageFile1) {
            formData.append('image1', roomData.imageFile1);
        }
        if (roomData.imageFile2) {
            formData.append('image2', roomData.imageFile2);
        }
        if (roomData.imageFile3) {
            formData.append('image3', roomData.imageFile3);
        }

        // Append video file if exists
        if (roomData.videoFile) {
            formData.append('video', roomData.videoFile);
        }

        try {
            // Send request to update room details
            await axios.put(`http://localhost:5000/api/rooms/update/${roomId}`, formData);
            alert('Room updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating room:', error);
            alert('Failed to update room. Please try again.');
        }
    };

    return (
        <div className="update-room">
            <h1>Update Room</h1>
            <div className="form-group">
                <label>Room Name:</label>
                <input type="text" name="name" value={roomData.name} onChange={handleChange} />

                <label>Max Guests:</label>
                <input type="number" name="maxcount" value={roomData.maxcount} onChange={handleChange} />

                <label>Phone Number:</label>
                <input type="text" name="phonenumber" value={roomData.phonenumber} onChange={handleChange} />

                <label>Rent per Day:</label>
                <input type="number" name="rentperday" value={roomData.rentperday} onChange={handleChange} />

                <label>Image 1:</label>
                <input type="file" name="imageFile1" onChange={handleFileChange} />

                <label>Image 2:</label>
                <input type="file" name="imageFile2" onChange={handleFileChange} />

                <label>Image 3:</label>
                <input type="file" name="imageFile3" onChange={handleFileChange} />

                <label>Video:</label>
                <input type="file" name="videoFile" onChange={handleFileChange} />

                <button onClick={handleUpdate} className="update-btn">Update Room</button>
            </div>
        </div>
    );
};

export default UpdateRoom;
