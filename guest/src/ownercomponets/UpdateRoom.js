import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UpdateRoom.css';

const UpdateRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // State for room details, including new fields
    const [roomData, setRoomData] = useState({
        name: '',
        maxcount: '',
        phonenumber: '',
        rentperday: '',
        room_type: '',
        description: '',
        wifi: 0,
        ac: 0,  
        tv: 0,
        imageFile1: null,
        imageFile2: null,
        imageFile3: null,
        videoFile: null,
    });

    // State for errors
    const [errors, setErrors] = useState({});

    // Fetch room details on load
    useEffect(() => {
        console.log('Fetching room details for roomId:', roomId); // Debug line
        axios
            .get(`http://localhost:5000/api/rooms/${roomId}`)
            .then((response) => {
                console.log('Received room data:', response.data); // Debug line
                const room = response.data;
                setRoomData({
                    name: room.name || '',
                    maxcount: room.maxcount || '',
                    phonenumber: room.phonenumber || '',
                    rentperday: room.rentperday || '',
                    room_type: room.room_type || '',
                    description: room.description || '',
                    wifi: room.wifi || 0,
                    ac: room.ac || 0,
                    tv: room.tv || 0,
                    imageFile1: null,
                    imageFile2: null,
                    imageFile3: null,
                    videoFile: null,
                });
            })
            .catch((error) => {
                console.error('Error fetching room details:', error);
                alert('Failed to fetch room details. Please try again.');
            });
    }, [roomId]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed - ${name}:`, value); // Debug line
        setRoomData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        console.log(`File selected - ${name}:`, files[0]); // Debug line
        setRoomData((prev) => ({ ...prev, [name]: files[0] }));
    };

    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        console.log(`Checkbox changed - ${name}:`, checked); // Debug line
        setRoomData((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
    };

    // Validation function
    const validate = () => {
        const newErrors = {};

        if (!roomData.name.trim()) newErrors.name = 'Room name is required';
        if (!roomData.maxcount || isNaN(roomData.maxcount) || roomData.maxcount <= 0)
            newErrors.maxcount = 'Max guests must be a positive number';

        if (!roomData.phonenumber) {
            newErrors.phonenumber = 'Phone number is required';
        } else if (!/^\d{10}$/.test(roomData.phonenumber)) {
            newErrors.phonenumber = 'Phone number must be exactly 10 digits';
        }

        if (!roomData.rentperday || isNaN(roomData.rentperday) || roomData.rentperday <= 0)
            newErrors.rentperday = 'Rent per day must be a positive number';

        if (!roomData.room_type.trim()) newErrors.room_type = 'Room type is required';
        if (!roomData.description.trim()) newErrors.description = 'Description is required';

        setErrors(newErrors);
        console.log('Validation Errors:', newErrors); // Debugging to see errors in console
        return Object.keys(newErrors).length === 0;
    };

    // Handle update
    const handleUpdate = async () => {
        console.log('Update button clicked'); // Debug line
        console.log('Current roomData:', roomData); // Debug line
        
        if (!validate()) {
            alert('Please fix the errors before updating.');
            return;
        }

        const formData = new FormData();

        // Append all fields to formData
        formData.append('name', roomData.name);
        formData.append('maxcount', roomData.maxcount);
        formData.append('phonenumber', roomData.phonenumber);
        formData.append('rentperday', roomData.rentperday);
        formData.append('room_type', roomData.room_type);
        formData.append('description', roomData.description);
        formData.append('wifi', roomData.wifi);
        formData.append('ac', roomData.ac);
        formData.append('tv', roomData.tv);

        // Append files only if they exist
        if (roomData.imageFile1) formData.append('image1', roomData.imageFile1);
        if (roomData.imageFile2) formData.append('image2', roomData.imageFile2);
        if (roomData.imageFile3) formData.append('image3', roomData.imageFile3);
        if (roomData.videoFile) formData.append('video', roomData.videoFile);

        console.log('FormData contents:'); // Debug line
        for (let [key, value] of formData.entries()) {
            console.log(key, value); // Debug line to show formData contents
        }

        try {
            console.log('Sending update request...'); // Debug line
            const response = await axios.put(`http://localhost:5000/api/rooms/update/${roomId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Update response:', response.data); // Debug line
            Swal.fire({
  title: 'Success!',
  text: 'Room updated successfully!',
  icon: 'success',
  confirmButtonText: 'OK',
  timer: 2000,
});
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating room:', error);
            if (error.response) {
                console.error('Server responded with:', error.response.data); // Debug line
            }
            alert('Failed to update room. Please try again.');
        }
    };

    return (
        <div className="main-content">
            <div className="content-header">
                <h1>Update Room Details</h1>
            </div>

            <div className="update-room-card">
                <div className="card-header">
                    <h2>Room Information</h2>
                    <div className="room-id">ID: ROOM {roomId}</div>
                </div>

                <div className="card-body">
                    <div className="form-grid">
                        {/* Room Name */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-door-open"></i> Room Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={roomData.name}
                                onChange={handleChange}
                                className={`form-input ${errors.name ? 'input-error' : ''}`}
                            />
                            {errors.name && <small className="error-text">{errors.name}</small>}
                        </div>

                        {/* Max Guests */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-user-friends"></i> Max Guests
                            </label>
                            <input
                                type="number"
                                name="maxcount"
                                value={roomData.maxcount}
                                onChange={handleChange}
                                className={`form-input ${errors.maxcount ? 'input-error' : ''}`}
                                min="1"
                            />
                            {errors.maxcount && <small className="error-text">{errors.maxcount}</small>}
                        </div>

                        {/* Phone Number */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-phone"></i> Phone Number
                            </label>
                            <input
                                type="text"
                                name="phonenumber"
                                value={roomData.phonenumber}
                                onChange={handleChange}
                                className={`form-input ${errors.phonenumber ? 'input-error' : ''}`}
                                maxLength={10}
                            />
                            {errors.phonenumber && <small className="error-text">{errors.phonenumber}</small>}
                        </div>

                        {/* Rent Per Day */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-money-bill-wave"></i> Rent Per Day
                            </label>
                            <input
                                type="number"
                                name="rentperday"
                                min="1"
                                value={roomData.rentperday}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                    if (e.key === '-' || e.key === 'e') {
                                        e.preventDefault(); // prevent minus and scientific notation input
                                    }
                                }}
                                className={`form-input ${errors.rentperday ? 'input-error' : ''}`}
                            />
                            {errors.rentperday && <small className="error-text">{errors.rentperday}</small>}
                        </div>

                        {/* Room Type */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-list"></i> Room Type
                            </label>
                            <select
                                name="room_type"
                                value={roomData.room_type}
                                onChange={handleChange}
                                className={`form-input ${errors.room_type ? 'input-error' : ''}`}
                            >
                                <option value="">-- Select Room Type --</option>
                                <option value="Standard Room">Standard Room</option>
                                <option value="Deluxe Room">Deluxe Room</option>
                                <option value="Super Deluxe Room">Super Deluxe Room</option>
                            </select>
                            {errors.room_type && <small className="error-text">{errors.room_type}</small>}
                        </div>

                        {/* Amenities */}
                        <div className="form-group">
                            <label className="form-label">
                                <i className="fas fa-concierge-bell"></i> Amenities
                            </label>
                            <div className="amenities-checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="wifi"
                                        checked={roomData.wifi === 1}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    WiFi
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="ac"
                                        checked={roomData.ac === 1}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    Air Conditioning
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="tv"
                                        checked={roomData.tv === 1}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="checkbox-custom"></span>
                                    TV
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-groupl full-widthl">
                            <label className="form-label">
                                <i className="fas fa-info-circle"></i> Description
                            </label>
                            <textarea
                                name="description"
                                value={roomData.description}
                                onChange={handleChange}
                                className={`form-input ${errors.description ? 'input-error' : ''}`}
                                rows={4}
                            ></textarea>
                            {errors.description && <small className="error-text">{errors.description}</small>}
                        </div>
                    </div>

                    {/* Media Upload Section */}
                    <div className="media-upload-section">
                        <h3>Media Uploads</h3>
                        <div className="upload-grid">
                            {['imageFile1', 'imageFile2', 'imageFile3'].map((fileName, index) => (
                                <div className="upload-box" key={fileName}>
                                    <label className="upload-label">
                                        <input
                                            type="file"
                                            name={fileName}
                                            onChange={handleFileChange}
                                            className="file-input"
                                            accept="image/*"
                                        />
                                        <i className="fas fa-image"></i>
                                        <span>
                                            {index === 0
                                                ? 'Primary Image'
                                                : index === 1
                                                    ? 'Secondary Image'
                                                    : 'Additional Image'}
                                        </span>
                                        {roomData[fileName] && (
                                            <span className="file-selected">
                                                <i className="fas fa-check-circle"></i> Selected
                                            </span>
                                        )}
                                    </label>
                                </div>
                            ))}

                            <div className="upload-box">
                                <label className="upload-label">
                                    <input
                                        type="file"
                                        name="videoFile"
                                        onChange={handleFileChange}
                                        className="file-input"
                                        accept="video/*"
                                    />
                                    <i className="fas fa-video"></i>
                                    <span>Room Video</span>
                                    {roomData.videoFile && (
                                        <span className="file-selected">
                                            <i className="fas fa-check-circle"></i> Selected
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    <button className="update-button" onClick={handleUpdate}>
                        Update Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateRoom;