import React, { useEffect, useState } from 'react';
import './UserProfile.css';

const UserProfile = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  const userId = user ? user.userId : null;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/user/${userId}`);
          const data = await response.json();

          if (response.ok) {
            setUserData(data);
          } else {
            setError(data.message);
          }
        } catch (err) {
          setError('Error fetching user profile');
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    } else {
      setError('No user logged in.');
      setLoading(false);
    }
  }, [userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('photo', file);

      try {
        const response = await fetch(`http://localhost:5000/api/user/upload-photo/${userId}`, {
          method: 'PUT',
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          setUserData(prevState => ({
            ...prevState,
            profile_photo: result.profilePhotoUrl
          }));
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Error uploading image');
      }
    }
  };

  if (loading) {
    return <div className="user-profile">Loading...</div>;
  }

  if (error) {
    return <div className="user-profile">{error}</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-sidebar">
        <div className="profile-photo-section">
          <img
            src={`http://localhost:5000${userData.profile_photo || '/uploads/profile_pics/default.png'}`}
            alt="Profile"
            className="profile-photo"
          />
         
          <i 
            className="fas fa-camera" 
            onClick={() => document.getElementById('imageInput').click()}
            style={{
              position: 'relative',
              top: '-30px',
              left:'-20px',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 152, 219, 0.9)',
              color: 'white',
              transition: 'all 0.3s ease'
            }}
          ></i>
          
          <input
            type="file"
            id="imageInput"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        
        <div className="profile-info">
          <h3>{userData.username}</h3>
          <p><i className="fas fa-envelope"></i> {userData.email}</p>
          <p><i className="fas fa-phone"></i> {userData.phone_number || 'Not provided'}</p>
          <p><i className="fas fa-calendar-alt"></i> Joined {new Date(userData.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-label"><i className="fas fa-user-friends"></i> Address:</span>
            <span className="stat-value">{userData.address1 || 'Not provided'} ,{userData.address2 || 'Not provided'} {userData.city || 'Not provided'}</span>

            <span className="stat-label"><i className="fas fa-user-friends"></i> Country:</span>
            <span className="stat-value">{userData.country || 'Not provided'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label"><i className="fas fa-heart"></i> Following</span>
            <span className="stat-value">567</span>
          </div>
          <div className="stat-item">
            <span className="stat-label"><i className="fas fa-image"></i> Posts</span>
            <span className="stat-value">89</span>
          </div>
        </div>
      </div>

      {/* New Section for Cards */}
      <div className="profile-cards">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <h5 className="card-title">Book {index + 1}</h5>
              <p className="card-text">Details about the booking will go here.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
