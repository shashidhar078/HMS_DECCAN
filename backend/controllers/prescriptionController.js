const Prescription = require('../models/prescriptionModel');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications, notes, fileName } = req.body;
    const doctorId = req.user._id;

    // Validate appointment exists and belongs to the doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to create prescription for this appointment' });
    }

    // Check if prescription already exists
    const existingPrescription = await Prescription.findOne({ appointmentId });
    if (existingPrescription) {
      return res.status(400).json({ message: 'Prescription already exists for this appointment' });
    }

    // Set filePath: prefer uploaded file, else generated fileName from body
    let filePath = undefined;
    if (req.file && req.file.filename) {
      filePath = `prescriptions/${req.file.filename}`;
    } else if (fileName) {
      filePath = `prescriptions/${fileName}`;
    }

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      doctorId,
      patientId: appointment.patientId,
      diagnosis,
      medications,
      filePath,
      notes
    });

    await prescription.save();

    // Update appointment status
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

// Get prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    // Check if user is authorized to view these prescriptions
    // Lab technicians and doctors can view all prescriptions
    if (!['admin', 'doctor', 'LabTechnician'].includes(userRole) && 
        userId.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these prescriptions' });
    }

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// Get prescriptions created by a doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const prescriptions = await Prescription.find({ doctorId })
      .populate('patientId', 'name')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// Download prescription file
exports.downloadPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log(`Download attempt - ID: ${id}, Role: ${userRole}`);

    const prescription = await Prescription.findById(id)
      .populate('doctorId', 'username')
      .populate('patientId', 'name customId');

    if (!prescription) {
      console.log('Prescription not found in database');
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if user is authorized to download
    const isAuthorized = userRole === 'Admin' || 
                        userRole === 'Doctor' || 
                        userRole === 'LabTechnician' ||
                        (prescription.patientId && prescription.patientId.toString() === userId.toString());

    if (!isAuthorized) {
      console.log('User not authorized to download');
      return res.status(403).json({ message: 'Not authorized to download this prescription' });
    }

    if (!prescription.filePath) {
      console.log('No file path in prescription record');
      return res.status(404).json({ message: 'Prescription file path not found in records' });
    }

    // Ensure prescriptions directory exists
    const prescriptionsDir = path.join(__dirname, '..', 'prescriptions');
    try {
      await fsPromises.access(prescriptionsDir);
    } catch (err) {
      await fsPromises.mkdir(prescriptionsDir, { recursive: true });
    }

    // Try different possible file paths
    let filePath;
    const possiblePaths = [
      path.join(__dirname, '..', prescription.filePath),
      path.join(__dirname, '..', 'prescriptions', path.basename(prescription.filePath)),
      path.join(__dirname, '..', 'uploads', 'prescriptions', path.basename(prescription.filePath))
    ];

    console.log('Checking possible file paths:', possiblePaths);

    // Check each path using async fs.access
    for (const pathToTry of possiblePaths) {
      try {
        await fsPromises.access(pathToTry);
        filePath = pathToTry;
        console.log('Found file at:', filePath);
        break;
      } catch (err) {
        console.log(`File not found at: ${pathToTry}`);
        continue;
      }
    }

    if (!filePath) {
      console.log('File not found in any of the possible locations');
      return res.status(404).json({ 
        message: 'Prescription file not found on server. Please contact the doctor to regenerate the prescription.',
        debug: process.env.NODE_ENV === 'development' ? {
          prescriptionId: prescription._id,
          filePath: prescription.filePath,
          checkedPaths: possiblePaths
        } : undefined
      });
    }

    // Generate a user-friendly filename with fallback values
    const timestamp = new Date().toISOString().split('T')[0];
    let sanitizedPatientName = 'unknown_patient';
    
    // Safely access patient name with fallbacks
    if (prescription.patientId && prescription.patientId.name) {
      sanitizedPatientName = prescription.patientId.name.replace(/[^a-zA-Z0-9]/g, '_');
    } else if (prescription.patientId && prescription.patientId.customId) {
      sanitizedPatientName = prescription.patientId.customId;
    }
    
    const fileName = `prescription_${sanitizedPatientName}_${timestamp}.pdf`;
    console.log('Generated filename:', fileName);

    // Set appropriate headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Create read stream using regular fs (not promises) and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: 'Error downloading prescription',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    });

  } catch (error) {
    console.error('Error downloading prescription:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error downloading prescription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only admin or the doctor who created it can delete
    if (userRole !== 'admin' && prescription.doctorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this prescription' });
    }

    // Delete the file
    try {
      await fsPromises.unlink(prescription.filePath);
    } catch (error) {
      console.error('Error deleting prescription file:', error);
    }

    // Delete the prescription record
    await prescription.remove();

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Error deleting prescription', error: error.message });
  }
}; 