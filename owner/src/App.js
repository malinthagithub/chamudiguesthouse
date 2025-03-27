import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Register from './Components/Register';
import AddRoom from './Components/AddRoom';
import OwnerRoomDashboard from './Components/OwnerRoomDashboard';
import UpdateRoom from './Components/UpdateRoom';
import RoomBookings from './Components/RoomBookings';
import Revenue from './Components/Revenue';
import RoomReview from './Components/RoomReview';
const App = () => {
  const [auth, setAuth] = useState(() => {
    return localStorage.getItem('auth') === 'true'; 
    // Ensure boolean conversion
  });

  useEffect(() => {
    localStorage.setItem('auth', auth.toString()); // Store as string
  }, [auth]);

  return (
    <Router>
      <Routes>
        {/* Login and Register Routes */}
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/register" element={<Register />} />

        {/* Owner Routes */}
        
        <Route path="/owner-dashboard" element={auth ? <OwnerRoomDashboard /> : <Navigate to="/login" />} />
        <Route path="/update-room/:roomId" element={auth ? <UpdateRoom /> : <Navigate to="/login" />} />
        <Route path="/room-bookings/:roomId" element={<RoomBookings />} />
        {/* Default Route */}
        <Route path="*" element={<Navigate to={auth ? '/owner-dashboard' : '/login'} />} />
        <Route path='/add-room' element={ <AddRoom /> } />
        <Route path='/revenue' element={ <Revenue />}/> 
        <Route path='comment' element={<RoomReview />} />
      </Routes>
    </Router>
  );
};

export default App;
