const express = require("express");
const router = express.Router();
const cors = require("cors");
const BookingController = require("../controllers/BookingController");

const bookingController = new BookingController();

router.use(cors());

// Route: POST /api/book-room
router.post("/book-room", bookingController.bookRoom.bind(bookingController));

module.exports = router;