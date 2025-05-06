const express = require("express");
const router = express.Router();
const { verifyToken, restrictTo } = require("../middlewares/authMiddleware");
const appointmentController = require("../controllers/appointmentController");

// Logging middleware
router.use((req, res, next) => {
    console.log(`Appointment route accessed: ${req.method} ${req.originalUrl}`);
    next();
});

// Protect all routes
router.use(verifyToken);

// Route to book an appointment
router.post("/book", restrictTo('Doctor', 'Receptionist', 'Patient'), appointmentController.bookAppointment);

// Route to get all appointments of a specific doctor
router.get("/doctor/:doctorId", restrictTo('Doctor', 'Receptionist'), appointmentController.getDoctorAppointments);

// Route to mark an appointment as completed
router.put("/complete/:appointmentId", restrictTo('Doctor'), appointmentController.completeAppointment);

// Route to get available slots for a doctor
router.get("/slots/:doctorId", appointmentController.getAvailableSlots);

// Route to get patient's appointments
router.get("/patient/:patientId", restrictTo('Patient', 'Receptionist'), appointmentController.getPatientAppointments);

module.exports = router;
