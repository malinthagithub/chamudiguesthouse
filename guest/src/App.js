import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import HomePage from './Components/HomePage';
import RoomDetails from './Components/RoomDetails';
import Navbar from './Components/Navbar'; // Regular Navbar
import BookingPage from './Components/BookingPage';
import About from './Components/About';
import ConfirmBooking from './Components/ConfirmBooking';
import HotelBookingPage from './Components/HotelBookingPage';
import OwnerRoomDashboard from './ownercomponets/OwnerRoomDashboard'; // Owner Dashboard
import AddRoom from './ownercomponets/AddRoom'; // Owner Add Room
import Revenue from './ownercomponets/Revenue'; // Owner Revenue
import RoomReview from './ownercomponets/RoomReview'; // Owner Review
import RoomBookings from './ownercomponets/RoomBookings'; // Owner Room Bookings
import UpdateRoom from './ownercomponets/UpdateRoom'; // Owner Update Room
import NavbarOwner from './ownercomponets/Navbar'; // Owner Navbar
import RoomCustomization from './Components/RoomCustomization';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ResetPassword from './Components/ResetPassword';
import Revenueclerk from './clerkcomponets/Revenueclerk';
import UserProfile from './Components/UserProfile';
import RoomSelection from './Components/RoomSelection';
import AllBookings from './ownercomponets/allbooking';
import FaqForm from './Components/FaqForm';
import ClerkFAQDashboard from './clerkcomponets/ClerkFAQDashboard';
import TodayBookings from './clerkcomponets/TodayBookings';
import RegisterClerk from './ownercomponets/RegisterClerk';
import CancellationsPage from './clerkcomponets/CancellationsPage';
import BookingCustomizations from './clerkcomponets/Bookingcustomization';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    const userToken = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (userToken && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setIsAuthenticated(true);
        setUsername(parsedUserData.username || 'Guest'); // Fallback username
      } catch (error) {
        console.error("Error parsing userData:", error);
        localStorage.removeItem('userData'); // Remove corrupted data
      }
    }
  }, []);

  return (
    
    <Router>
      <MainContent 
        isAuthenticated={isAuthenticated} 
        setIsAuthenticated={setIsAuthenticated} 
        username={username} 
        setUsername={setUsername} 
      />
    </Router>
  );
};

// Separate component for routing and Navbar logic
const MainContent = ({ isAuthenticated, setIsAuthenticated, username, setUsername }) => {
  const location = useLocation();

  // Check if we are on the owner routes
  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isUserProfileRoute = location.pathname === '/user-profile'; // Check if it's the /user-profile route

  return (
    
    <div className="App">
      {/* Conditionally render the correct Navbar */}
      
      {location.pathname !== '/user-profile'&&location.pathname !== '/hotel' && (
        isOwnerRoute ? (
          <NavbarOwner 
            isAuthenticated={isAuthenticated} 
            username={username} 
            setIsAuthenticated={setIsAuthenticated} 
          />
        ) : (
          <Navbar 
            isAuthenticated={isAuthenticated} 
            username={username} 
            setIsAuthenticated={setIsAuthenticated} 
          />
        )
        
        
      )}

      <Routes>
        {/* HotelBookingPage is the first route */}
        <Route path="/hotel" element={<HotelBookingPage />} />

        {/* Redirect unauthenticated users to login page */}
        <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/hotel" />} />

        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:room_id" element={<RoomDetails />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/confirm" element={<ConfirmBooking />} />
        
        {/* Owner Dashboard routes */}
        <Route path="/dashboard" element={<OwnerRoomDashboard />} />
        <Route path="/add-room" element={<AddRoom />} />
        <Route path="/update-room/:roomId" element={isAuthenticated ? <UpdateRoom /> : <Navigate to="/login" />} />
        <Route path="/room-bookings/:roomId" element={<RoomBookings />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/comment" element={<RoomReview />} />
        <Route path="/room-customization/:roomId" element={<RoomCustomization />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/revenueclerk" element={<Revenueclerk />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/room-selection" element={<RoomSelection />} />
        <Route path="/all-bookings" element={<AllBookings />} />
        <Route path="/faq" element={<FaqForm />} />
        <Route path="/clerk-faq-dashboard" element={<ClerkFAQDashboard />} />
        <Route path="/today-bookings" element={<TodayBookings />} />
        <Route path="/register-clerk" element={<RegisterClerk />} />
        <Route path="/cancellations" element={<CancellationsPage />} />
        <Route path="/booking-customizations" element={<BookingCustomizations />} />
        {/* Clerk routes */}
      </Routes>
    </div>
  );
};

export default App;

