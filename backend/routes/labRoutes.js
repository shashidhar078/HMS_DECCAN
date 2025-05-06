const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { verifyToken, verifyLabTechnician, restrictTo } = require('../middlewares/authMiddleware');
const Patient = require('../models/patientModel');

// Authentication routes
router.post('/register', labController.register);
router.post('/login', labController.login);

// Lab technician specific routes
router.get('/pending-tests', verifyToken, labController.getLabRequests);
router.put('/tests/:testId', verifyToken, labController.updateLabResult);
router.get('/my-reports', verifyToken, labController.getMyReports);
router.get('/patients-served-today', verifyToken, labController.getPatientsServedToday);
router.post('/upload-report', verifyToken, labController.uploadReport);
router.get('/prescriptions/latest/:patientId', verifyToken, labController.downloadLatestPrescription);

// Lab report management
router.post('/reports', verifyToken, labController.createLabReport);
router.put('/reports/:reportId', verifyToken, labController.updateLabReport);
router.get('/reports/:reportId', verifyToken, labController.getLabReport);
router.get('/patient-reports/:patientId', verifyToken, labController.getPatientReports);

// Search patients (for lab technicians)
// router.get('/patients/search', verifyLabTechnician, async (req, res) => {
//   try {
//     const { query } = req.query;
//     const patients = await Patient.find({
//       $or: [
//         { name: { $regex: query, $options: 'i' } },
//         { email: { $regex: query, $options: 'i' } },
//         { contactNumber: { $regex: query, $options: 'i' } },
//         { customId: { $regex: query, $options: 'i' } }
//       ]
//     }).select('-password -otp -otpExpiry');
    
//     res.json({ success: true, data: patients });
//   } catch (error) {
//     console.error('Error searching patients:', error);
//     res.status(500).json({ success: false, message: 'Error searching patients' });
//   }
// });
router.get('/patients/search',async (req, res) => {
  try {
    const { query } = req.query;
    const patients = await Patient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { contactNumber: { $regex: query, $options: 'i' } },
        { customId: { $regex: query, $options: 'i' } }
      ]
    }).select('-password -otp -otpExpiry');
    
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error searching patients:', error);
    res.status(500).json({ success: false, message: 'Error searching patients' });
  }
});

module.exports = router; 