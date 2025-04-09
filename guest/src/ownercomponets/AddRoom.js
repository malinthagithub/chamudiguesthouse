import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddRoom.css';

const AddRoom = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [roomData, setRoomData] = useState({
    name: '',
    maxcount: '',
    phonenumber: '',
    rentperday: '',
    room_type: '',
    room_size: '',
    discount_percentage: '',
  });

  const [files, setFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
    video: null,
  });

  const [previews, setPreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
    video: null,
  });
  useEffect(() => {
    document.body.classList.add('addroom-background');
    return () => {
      document.body.classList.remove('addroom-background');
    };
  }, []);

  const handleChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFiles({ ...files, [e.target.name]: file });

    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviews({
          ...previews,
          [e.target.name]: event.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setActiveStep(activeStep + 1);
  const prevStep = () => setActiveStep(activeStep - 1);

  const handleSubmit = async () => {
    const formData = new FormData();

    // Append room data
    Object.keys(roomData).forEach((key) => {
      formData.append(key, roomData[key]);
    });

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });

    try {
      await axios.post('http://localhost:5000/api/rooms/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Room added successfully!');
      // Reset form
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
      setPreviews({ image1: null, image2: null, image3: null, video: null });
      setActiveStep(1);
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room. Please try again.');
    }
  };

  const renderStep = () => {
  
    switch (activeStep) {
      case 1:
        return (
          <div className="step-card">
            <h2>Basic Information</h2>
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={roomData.name}
                onChange={handleChange}
                placeholder="Room Name"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="maxcount"
                value={roomData.maxcount}
                onChange={handleChange}
                placeholder="Max Guests"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="phonenumber"
                value={roomData.phonenumber}
                onChange={handleChange}
                placeholder="Contact Number"
                required
              />
            </div>
            <button className="next-btn" onClick={nextStep}>
              Continue
            </button>
          </div>
        );
      case 2:
        return (
          <div className="step-card">
            <h2>Pricing Details</h2>
            <div className="input-group">
              <input
                type="number"
                name="rentperday"
                value={roomData.rentperday}
                onChange={handleChange}
                placeholder="Daily Rate ($)"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="number"
                name="discount_percentage"
                value={roomData.discount_percentage}
                onChange={handleChange}
                placeholder="Discount Percentage"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                name="room_type"
                value={roomData.room_type}
                onChange={handleChange}
                placeholder="Room Type (e.g., Deluxe)"
                required
              />
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={prevStep}>
                Back
              </button>
              <button className="next-btn" onClick={nextStep}>
                Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-card">
            <h2>Room Specifications</h2>
            <div className="input-group">
              <input
                type="number"
                name="room_size"
                value={roomData.room_size}
                onChange={handleChange}
                placeholder="Size (sq ft)"
                required
              />
            </div>
            <div className="file-upload-group">
              <h3>Upload Images</h3>
              <div className="image-grid">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="image-upload-card">
                    {previews[`image${num}`] ? (
                      <img src={previews[`image${num}`]} alt={`Preview ${num}`} />
                    ) : (
                      <div className="upload-placeholder">
                        <span>+</span>
                        <p>Image {num}</p>
                      </div>
                    )}
                    <input
                      type="file"
                      name={`image${num}`}
                      onChange={handleFileChange}
                      accept="image/*"
                      required={num === 1}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={prevStep}>
                Back
              </button>
              <button className="next-btn" onClick={nextStep}>
                Continue
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-card">
            <h2>Video Preview</h2>
            <div className="video-upload">
              {previews.video ? (
                <video controls>
                  <source src={previews.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="video-placeholder">
                  <span>🎥</span>
                  <p>Upload Room Video</p>
                </div>
              )}
              <input
                type="file"
                name="video"
                onChange={handleFileChange}
                accept="video/*"
                required
              />
            </div>
            <div className="review-section">
              <h3>Review Details</h3>
              <div className="review-grid">
                <div>
                  <p>Room Name</p>
                  <span>{roomData.name}</span>
                </div>
                <div>
                  <p>Max Guests</p>
                  <span>{roomData.maxcount}</span>
                </div>
                <div>
                  <p>Daily Rate</p>
                  <span>${roomData.rentperday}</span>
                </div>
                <div>
                  <p>Room Type</p>
                  <span>{roomData.room_type}</span>
                </div>
              </div>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={prevStep}>
                Back
              </button>
              <button className="submit-btn" onClick={handleSubmit}>
                Add Room
              </button>
            </div>
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className=" add-room-page add-room-container">
      <div className="progress-bar">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`progress-step ${activeStep >= step ? 'active' : ''}`}
          >
            <div className="step-number">{step}</div>
          </div>
        ))}
      </div>
     
      {renderStep()}
    </div>
   
  );
  
};


export default AddRoom;