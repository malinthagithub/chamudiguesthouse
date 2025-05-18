import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './Components/Login';
import Register from './Components/Register';
import HomePage from './Components/HomePage';
import RoomDetails from './Components/RoomDetails';
import Navbar from './Components/Navbar';
import BookingPage from './Components/BookingPage';
import About from './Components/About';
import ConfirmBooking from './Components/ConfirmBooking';
import HotelBookingPage from './Components/HotelBookingPage';
import OwnerRoomDashboard from './ownercomponets/OwnerRoomDashboard';
import AddRoom from './ownercomponets/AddRoom';
import Revenue from './ownercomponets/Revenue';
import RoomReview from './ownercomponets/RoomReview';
import RoomBookings from './ownercomponets/RoomBookings';
import UpdateRoom from './ownercomponets/UpdateRoom';
import NavbarOwner from './ownercomponets/Navbar';
import RoomCustomization from './Components/RoomCustomization';
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
import ClerkAvailable from './clerkcomponets/ClerkAvailable';
import GuestWalkinForm from './clerkcomponets/GuestWalkinForm';
import WalkinPayment from './clerkcomponets/WalkinPayment';
import WalkinBookings from './clerkcomponets/WalkinBookings';

// PrivateRoute wrapper
const PrivateRoute = ({ isAuthenticated, children ,loading,}) => {
   if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    console.log("PrivateRoute: User not authenticated, redirecting to /login");
     return <Navigate to="/login" replace />;
  }
  return children;
};

// Role-based protected route
const RoleProtectedRoute = ({ isAuthenticated, userRole, allowedRoles, children,loading, }) => {
   if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    console.log("RoleProtectedRoute: User not authenticated, redirecting to /login.");
   return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(userRole)) {
    console.log(`RoleProtectedRoute: User role '${userRole}' not allowed, redirecting to home.`);
    let redirectPath = "/"; // default redirect for guest

    if (userRole === "owner") {
      redirectPath = "/revenue";
    } else if (userRole === "clerk") {
      redirectPath = "/revenueclerk";
    } else if (userRole === "guest") {
      redirectPath = "/";
    }

    return <Navigate to={redirectPath} replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('guest'); // default role
  const [loading, setLoading] = useState(true);  // new loading state

  useEffect(() => {
    console.log("App useEffect: Checking sessionStorage for token and userData...");

    const userToken = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('userData');

    console.log("Raw userData from sessionStorage:", userData);

    if (userToken && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserRole(parsedUserData.role || 'guest');
        setUsername(parsedUserData.username || '');
        console.log("App useEffect: Authenticated as:", parsedUserData.role);
      } catch (error) {
        console.error("Error parsing userData:", error);
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole('guest');
        setUsername('');
      }
    } else {
      console.log("App useEffect: No token or userData found in sessionStorage.");
      setIsAuthenticated(false);
      setUserRole('guest');
      setUsername('');
    }
     setLoading(false); // done loading session check
  }, []);
  if (loading) {
    // Render a loading spinner or empty div while checking session
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <MainContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        username={username}
        setUsername={setUsername}
        userRole={userRole}
        setUserRole={setUserRole}
      />
    </Router>
  );
};

const MainContent = ({ isAuthenticated, setIsAuthenticated, username, setUsername, userRole, setUserRole }) => {
  const location = useLocation();

  if (!userRole) {
    console.log("MainContent: Waiting for userRole to load...");
    return <div>Loading...</div>;
  }

  console.log("MainContent: Rendering routes for userRole:", userRole);

  return (
    <div className="App">
      {/* Navbar rendering based on user role */}
      {location.pathname !== '/user-profile' && location.pathname !== '/hotel' && (
        userRole === 'gg' ? (
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
        <Route path="/hotel" element={<HotelBookingPage />} />
      <Route
  path="/"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['guest']}
    >
      <HomePage />
    </RoleProtectedRoute>
  }
/>

        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUsername={setUsername}
              setUserRole={setUserRole} // Important: pass setUserRole here
            />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:room_id" element={<RoomDetails />} />

        {/* Protected guest routes */}
        <Route
          path="/booking"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <BookingPage />
            </PrivateRoute>
          }
        />

        {/* About page for guests only */}
        <Route
          path="/about"
          element={
            <RoleProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              allowedRoles={['guest']}
            >
              <About />
            </RoleProtectedRoute>
          }
        />

        {/* Owner & Clerk routes */}
        <Route
  path="/confirm"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['guest']}   // ✅ guests only
    >
      <ConfirmBooking />
    </RoleProtectedRoute>
  }
/>

        <Route
  path="/dashboard"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <OwnerRoomDashboard />
    </RoleProtectedRoute>
  }
/>

       <Route
  path="/add-room"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <AddRoom />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/update-room/:roomId"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <UpdateRoom />
    </RoleProtectedRoute>
  }
/>

        <Route path="/room-bookings/:roomId" element={<RoomBookings />} />
        <Route
  path="/revenue"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <Revenue />
    </RoleProtectedRoute>
  }
/>

       <Route
  path="/comment"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <RoomReview />
    </RoleProtectedRoute>
  }
/>

       <Route
  path="/room-customization/:roomId"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['guest']}
    >
      <RoomCustomization />
    </RoleProtectedRoute>
  }
/>

        <Route path="/reset-password/:token" element={<ResetPassword />} />
       <Route
  path="/revenueclerk"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <Revenueclerk />
    </RoleProtectedRoute>
  }
/>

       <Route
  path="/user-profile"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['guest']}
    >
      <UserProfile />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/room-selection"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['guest']}
    >
      <RoomSelection />
    </RoleProtectedRoute>
  }
/>

      <Route
  path="/all-bookings"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <AllBookings />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/faq"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <FaqForm />
    </RoleProtectedRoute>
  }
/>

<Route
  path="/clerk-faq-dashboard"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <ClerkFAQDashboard />
    </RoleProtectedRoute>
  }
/>

       <Route
  path="/today-bookings"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <TodayBookings />
    </RoleProtectedRoute>
  }
/>

        <Route
  path="/register-clerk"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['owner']}
    >
      <RegisterClerk />
    </RoleProtectedRoute>
  }
/>

        <Route
  path="/cancellations"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <CancellationsPage />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/booking-customizations"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <BookingCustomizations />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/clerk-available"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <ClerkAvailable />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/walkin-payment"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <GuestWalkinForm />
    </RoleProtectedRoute>
  }
/>

      <Route
  path="/walkin-payment"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <WalkinPayment />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/payment"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <WalkinPayment />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/walk_view"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <WalkinBookings />
    </RoleProtectedRoute>
  }
/>
<Route
  path="/walkin-bookings"
  element={
    <RoleProtectedRoute
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      allowedRoles={['clerk']}
    >
      <WalkinBookings />
    </RoleProtectedRoute>
  }
/>

      </Routes>
    </div>
  );
};

export default App;
