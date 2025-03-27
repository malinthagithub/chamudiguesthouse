import React from 'react';
import './About.css';
import aboutImage from '../images/about.jpg';  // Import the image from the correct path

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>Welcome to Chamudi Guest House and Restaurant</h1>
        <p>Your perfect getaway for a relaxing stay in the heart of nature.</p>
      </div>

      <div className="about-content">
        <div className="about-text">
          <h2>About the Hotel</h2>
          <p>
            Chamudi Guest House and Restaurant is a serene and welcoming hotel located in a beautiful setting, offering guests the best of comfort, luxury, and convenience.
            Our hotel provides an array of services to ensure a memorable experience, including cozy rooms, a delicious menu at our restaurant, and friendly staff available to assist you at all times.
          </p>
          <p>
            Whether you're here for business or leisure, our facilities are designed to make your stay as enjoyable as possible. Explore our range of rooms, each thoughtfully designed for relaxation and comfort.
          </p>
        </div>

        <div className="about-image">
          <img
            src={aboutImage}  // Use the imported aboutImage here
            alt="Chamudi Guest House and Restaurant"
            className="hotel-image"
          />
        </div>
      </div>

      <div className="about-footer">
        <h3>Book Your Stay Now</h3>
        <p>We look forward to hosting you at Chamudi Guest House and Restaurant.</p>
      </div>
    </div>
  );
};

export default About;
