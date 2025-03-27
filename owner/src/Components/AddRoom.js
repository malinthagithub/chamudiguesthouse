import React, { useState } from 'react';
import axios from 'axios';
import './AddRoom.css';  // Make sure to import the CSS file

const AddRoom = () => {
  const [roomData, setRoomData] = useState({
    name: '',
    maxcount: '',
    phonenumber: '',
    rentperday: '',
    room_type: '', // Added room_type
    room_size: '', // Added room_size
    discount_percentage: '', // Added discount_percentage
  });

  const [files, setFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
    video: null,
  });

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append room data
    Object.keys(roomData).forEach((key) => {
      formData.append(key, roomData[key]);
    });

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key]);
      } else {
        alert(`Please upload ${key}`);
        return;
      }
    });

    try {
      const response = await axios.post('http://localhost:5000/api/rooms/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
      // Reset form after submission
      setRoomData({
        name: '',
        maxcount: '',
        phonenumber: '',
        rentperday: '',
        room_type: '',
        room_size: '',
        discount_percentage: '',
      });
      setFiles({ image1: null, image2: null, image3: null, video: null });
    } catch (error) {
      console.error('Error adding room:', error.response?.data || error.message);
      alert('Failed to add room. Please try again.');
    }
  };

  return (
    <div className="add-room-container">
      <h2 className="form-title">Add New Room</h2>
      <form className="add-room-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="input-group">
          <label htmlFor="name">Room Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Room Name"
            value={roomData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="maxcount">Max Count</label>
          <input
            type="number"
            id="maxcount"
            name="maxcount"
            placeholder="Max Count"
            value={roomData.maxcount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="phonenumber">Phone Number</label>
          <input
            type="text"
            id="phonenumber"
            name="phonenumber"
            placeholder="Phone Number"
            value={roomData.phonenumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="rentperday">Rent per Day</label>
          <input
            type="number"
            id="rentperday"
            name="rentperday"
            placeholder="Rent per Day"
            value={roomData.rentperday}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="room_type">Room Type</label>
          <input
            type="text"
            id="room_type"
            name="room_type"
            placeholder="Room Type"
            value={roomData.room_type}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="room_size">Room Size (in sq. ft.)</label>
          <input
            type="number"
            id="room_size"
            name="room_size"
            placeholder="Room Size"
            value={roomData.room_size}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="discount_percentage">Discount Percentage</label>
          <input
            type="number"
            id="discount_percentage"
            name="discount_percentage"
            placeholder="Discount Percentage"
            value={roomData.discount_percentage}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="image1">Room Image 1</label>
          <input
            type="file"
            id="image1"
            name="image1"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="image2">Room Image 2</label>
          <input
            type="file"
            id="image2"
            name="image2"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="image3">Room Image 3</label>
          <input
            type="file"
            id="image3"
            name="image3"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="video">Room Video</label>
          <input
            type="file"
            id="video"
            name="video"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Add Room</button>
      </form>
    </div>
  );
};

export default AddRoom;
