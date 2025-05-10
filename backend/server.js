const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");  // Ensure correct path to your database file

// Import routes
const stripeRoutes = require("./routes/stripeRoutes");
const roomRoutes = require("./routes/room");
const userRoutes = require("./routes/users");
const availableRoutes = require('./routes/available'); // Import the availability route
const bookingRoutes = require("./routes/bookingRoutes");
const searchRoutes = require('./routes/searchRoutes');
const reviewRoutes = require('./routes/reviews');
const revenueroutes = require('./routes/revenue');
const booktodyRoute = require('./routes/booktody');
const reportRoutes = require('./routes/reportRoutes');
const reviewOwnerRoutes = require('./routes/reviewOwnerRoutes'); 
const customizationroutes = require('./routes/customizationRoutes'); // Import the customization route
const cancelBookingRoute = require("./routes/cancelBooking");
const userProfileRoutes = require("./routes/userRoutes"); // Import user profile route
const faqRoutes = require("./routes/faqRoutes"); // Import FAQ route
// Create an Express app
const app = express();

// Middleware setup
app.use(express.json());  // Allows parsing of JSON data in requests
app.use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:3001","http://localhost:3003" ], // Allow multiple origins
      credentials: true, // Allow cookies/auth headers if needed
    })
  );
   // Enable CORS for frontend
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// Define API routes
app.use("/api/stripe", stripeRoutes); // Payment & Booking API
app.use("/api/rooms", roomRoutes);    // Room-related API
app.use("/api/users", userRoutes);    // User-related API (register, login)
app.use('/api/available', availableRoutes);
app.use("/api/bookings", bookingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/revenue', revenueroutes);
app.use('/api/booktody', booktodyRoute);
app.use('/api/reports', reportRoutes);
app.use('/room', reviewOwnerRoutes);// Add owner route
app.use('/api/customization', customizationroutes); // Add customization route
app.use("/api", cancelBookingRoute);
app.use("/api/user", userProfileRoutes); // User profile route
app.use("/api/faqs", faqRoutes); // FAQ route

// Connect to the database and start the server
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL database!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});
