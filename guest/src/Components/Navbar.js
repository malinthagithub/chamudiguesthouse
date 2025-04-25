import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaInfoCircle, FaBook } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ isAuthenticated, username, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Retrieve user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userRole = userData?.role; // Assuming the role is stored in userData

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setMenuOpen(false); // Close menu after logout
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(50, 48, 48, 0.7)',  // Semi-transparent background
      backdropFilter: 'blur(0px)',  // Blur the content behind the navbar
      color: 'white',
      padding: '20px 30px',
      zIndex: 9999,  // Keeps navbar above content
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      boxSizing: 'border-box',
      height: '70px',
    }} className="navbar">
      <div className="navbar-container">
        <Link 
  to={userRole === 'owner' ? '/revenue' : '/'} 
  className="navbar-logo" 
  onClick={() => setMenuOpen(false)}
>
  Chamudi
</Link>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Navigation Links */}
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {/* Show Booking and About links only for non-owner authenticated users */}
          {isAuthenticated && userRole === 'guest' && (
            <>
            
              <Link to="/Room-Selection" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FaBook /> Room Customization
              </Link>
              <Link to="/confirm" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FaBook /> Booking
              </Link>
              <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FaInfoCircle /> About
              </Link>
            </>
          )}

{isAuthenticated ? (
  <>
    {username && (
      userRole === 'guest' ? (
        <Link 
          to="/user-profile" 
          className="nav-link" 
          onClick={() => setMenuOpen(false)}
        >
          <span className="username">
            <FaUser /> {username}
          </span>
        </Link>
      ) : (
        <span className="nav-link username">
          <FaUser /> {username}
        </span>
      )
    )}
    <button className="logout-btn" onClick={handleLogout}>
      <FaSignOutAlt /> Sign out
    </button>
  </>
) : (
  <>
    <Link 
      to="/login" 
      className="navbar-log" 
      onClick={() => setMenuOpen(false)}
    >
      Sign in
    </Link>
    <Link 
      to="/register" 
      className="navbar-log" 
      onClick={() => setMenuOpen(false)}
    >
      Sign up
    </Link>
  </>
)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
