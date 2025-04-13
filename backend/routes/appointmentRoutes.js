const express = require("express");
const router = express.Router();
const { verifyAdmin, authMiddleware } = require("../middlewares/authMiddleware"); // 🔹 Import `authMiddleware`
const appointmentController = require("../controllers/appointmentController");

// 📌 Route to book an appointment (Only accessible by authorized users)
router.post("/book", authMiddleware, appointmentController.bookAppointment);

// 📌 Route to get all appointments of a specific doctor
router.get("/doctor/:doctorId", authMiddleware, appointmentController.getDoctorAppointments);

// 📌 Route to mark an appointment as completed
router.put("/complete/:appointmentId", authMiddleware, appointmentController.completeAppointment);

module.exports = router;
