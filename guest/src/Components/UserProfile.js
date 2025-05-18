import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate

const UserProfile = () => {
 const user = JSON.parse(sessionStorage.getItem('userData'));
  const userId = user ? user.userId : null;
  const navigate = useNavigate(); // ✅ Initialize navigate

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

  if (loading) return <div className="user-profile">Loading...</div>;
  if (error) return <div className="user-profile">{error}</div>;

  // Card data
  const cards = [
    {
      title: "CHAMUDI GUEST HOUSE",
      text: "Enjoy a comfortable stay with premium amenities.",
      text1: "Discount Points",
      showProgress: true,
      progress: userData?.loyalty_points || 0
    },
    {
      title: "BOOKING ROOMS",
      text: "Enjoy a comfortable stay with premium amenities."
    },
    {
      title: "customization Room",
      text: "Spacious room perfect for family vacations."
    },
    {
      title: "Deluxe King",
      text: "Elegant room with a king-sized bed and city view."
    },
    {
      title: "Budget Single",
      text: "Affordable stay with all essential facilities."
    }
  ];

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
              top: '-60px',
              left: '150px',
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

      {/* Profile Cards Section */}
      <div className="profile-cards">
        {cards.map((item, index) => (
          <div 
            key={index}
            className="card"
            onClick={() => {
              if (item.title === "BOOKING ROOMS") {
                navigate('/confirm'); // ✅ Navigate when this card is clicked
              }
              else if (item.title === "customization Room") {
                navigate('/Room-Selection'); // ✅ Navigate when this card is clicked
              }
            }}
            style={{ cursor: item.title === "BOOKING ROOMS" || item.title === "customization Room"? 'pointer' : 'default' }}
          >
            <div className="card-body">
              <h5 className="card-title">{item.title}</h5>
              <p className="card-text">{item.text}</p>
              <p style={{ margin: "10px auto", position: "relative", top: "-10px", left: "400px", color: "white" }}>{item.text1}</p>
              {item.showProgress && (
                <div style={{ width: 100, height: 60, margin: "10px auto", position: "relative", top: "-160px", left: "400px" }}>
                  <CircularProgressbar
                    value={item.progress}
                    text={`${item.progress}%`}
                    styles={buildStyles({
                      pathColor: item.progress === 100 ? "#d4ff00" : "#6aff00",
                      textColor: "white",
                      trailColor: "#eee",
                      backgroundColor: "#473939"
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
