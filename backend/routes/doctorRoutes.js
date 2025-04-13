const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const User = require("../models/userModel");
const {
    getPatientDetails,
    getNotifications,
    markNotificationAsRead,
    clearReadNotifications
} = require("../controllers/doctorController");

// Fetch doctors from User model
router.get("/doctors", async (req, res) => {
    try {
        const doctors = await User.find({ role: "Doctor" }).select("-password"); // Exclude password field for security
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ message: "Failed to fetch doctors", error: error.message });
    }
});

// Get all doctor notifications
router.get("/notifications", authMiddleware, getNotifications);

// Mark a notification as read
router.put("/notifications/read/:notificationId", authMiddleware, markNotificationAsRead);

// Clear all read notifications
router.delete("/notifications/clear", authMiddleware, clearReadNotifications);

// Fetch patient details
router.get("/patient/:customId", authMiddleware, getPatientDetails);

module.exports = router;
