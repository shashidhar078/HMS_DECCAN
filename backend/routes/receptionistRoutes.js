const express = require("express");
const router = express.Router();
const receptionistController = require("../controllers/receptionistController");
const { verifyReceptionist } = require("../middlewares/authMiddleware");

// Patient Routes
router.post("/patients", verifyReceptionist, receptionistController.registerPatient);
router.get("/patients/:customId", verifyReceptionist, receptionistController.getPatientByCustomId);

// Appointment Routes
router.post("/appointments", verifyReceptionist, receptionistController.bookAppointment);
router.put("/appointments/:id", verifyReceptionist, receptionistController.updateAppointmentStatus);
router.get("/appointments", verifyReceptionist, receptionistController.getAllAppointments);

module.exports = router;