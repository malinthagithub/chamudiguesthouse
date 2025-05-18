import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAuthenticated, username, setIsAuthenticated }) => {
  const navigate = useNavigate();

 // Changed from localStorage to sessionStorage
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const userRole = userData?.role;

  const handleLogout = () => {
    // Changed from localStorage to sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    setIsAuthenticated(false);
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
       

        <div className="navbar-link">
        {isAuthenticated && (
            <>
             
            </>
          )}
          {isAuthenticated && (
            <>
              <Link to="/about" className="nav-link">About</Link>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              {username && <span className="username">Hello, {username}!</span>}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
