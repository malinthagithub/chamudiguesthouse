import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaInfoCircle, FaBook } from 'react-icons/fa';
import './Navbar.css';
import FaqModal from './FaqModal'; // Import the FAQ modal component

const Navbar = ({ isAuthenticated, username, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

 const userData = JSON.parse(sessionStorage.getItem('userData'));
const userRole = userData?.role;

const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userData');
  setIsAuthenticated(false);
  setMenuOpen(false);
  navigate('/login');
};


  // Custom component that looks like Link but opens modal
  const FaqLink = ({ children }) => (
    <div 
      className="nav-link"
      onClick={() => {
        setShowFaqModal(true);
        setMenuOpen(false);
      }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: 'rgba(50, 48, 48, 0.7)',
        backdropFilter: 'blur(0px)',
        color: 'white',
        padding: '20px 30px',
        zIndex: 9999,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        boxSizing: 'border-box',
        height: '70px',
      }} className="navbar">
        <div className="navbar-container">
          {/* Chamudi logo with role-based route */}
          <Link 
            to={
              userRole === 'owner'
                ? '/revenue'
                : userRole === 'clerk'
                ? '/revenueclerk'
                : '/'
            }
            className="navbar-logo" 
            onClick={() => setMenuOpen(false)}
          >
            Chamudi Guest House
          </Link>

          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
            {isAuthenticated && userRole === 'guest' && (
              <>
                <Link to="/Room-Selection" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <FaBook /> Room Customization
                </Link>
                
                <FaqLink>
                  <FaBook /> FAQ
                </FaqLink>
                
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

      {/* FAQ Modal */}
      <FaqModal 
        isOpen={showFaqModal}
        onClose={() => setShowFaqModal(false)}
      />
    </>
  );
};

export default Navbar;
