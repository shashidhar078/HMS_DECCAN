const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const User = require('../models/userModel');
const Appointment = require('../models/appointmentModel');

// Protect all routes
router.use(verifyToken);

// Get available doctors and their time slots

// Prescription routes - keep these at the top
router.post('/prescriptions/generate', restrictTo('Doctor'), doctorController.generatePrescriptionPDF);
router.get('/prescriptions', restrictTo('Doctor'), doctorController.getPrescriptions);
router.get('/prescriptions/:id/download', restrictTo('Doctor'), doctorController.downloadPrescription);
router.post('/prescriptions', restrictTo('Doctor'), upload.single('prescription'), doctorController.createPrescription);
router.get('/appointments/latest/:patientId', restrictTo('Doctor'), doctorController.getLatestPatientAppointment);

// Patient APIs
router.get('/patients', restrictTo('Doctor'), doctorController.getAllPatients);
router.get('/patients/booked', restrictTo('Doctor'), doctorController.getBookedPatients);
router.get('/patients/:customId', restrictTo('Doctor'), doctorController.getPatientDetails);
router.get('/patients/:customId/prescriptions', restrictTo('Doctor'), doctorController.getPatientPrescriptions);

// Notifications
router.get('/notifications', restrictTo('Doctor'), doctorController.getNotifications);
router.patch('/notifications/read/:notificationId', restrictTo('Doctor'), doctorController.markNotificationAsRead);
router.delete('/notifications/clear', restrictTo('Doctor'), doctorController.clearReadNotifications);

// Profile and stats
router.get('/me', restrictTo('Doctor'), doctorController.getCurrentDoctor);
router.get('/stats', restrictTo('Doctor'), doctorController.getDoctorStats);

// Appointments
router.get('/appointments', restrictTo('Doctor'), doctorController.getDoctorAppointments);
router.put('/appointments/:id/complete', restrictTo('Doctor'), doctorController.completeAppointment);

// Get doctor profile
router.get('/profile', restrictTo('Doctor'), async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!doctor || doctor.role !== 'Doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Error fetching doctor profile', error: error.message });
  }
});

module.exports = router;
