const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'prescriptions/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes
router.post('/', verifyToken, restrictTo('Doctor'), upload.single('file'), prescriptionController.createPrescription);
router.get('/patient/:patientId', verifyToken, prescriptionController.getPatientPrescriptions);
router.get('/doctor', verifyToken, restrictTo('Doctor'), prescriptionController.getDoctorPrescriptions);
router.get('/:id/download', verifyToken, restrictTo('Doctor', 'LabTechnician', 'Patient'), prescriptionController.downloadPrescription);
router.delete('/:id', verifyToken, restrictTo('Admin', 'Doctor'), prescriptionController.deletePrescription);

module.exports = router; 