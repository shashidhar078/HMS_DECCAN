const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const LabReport = require('../models/labReportModel');
const Patient = require('../models/patientModel');
const { sendEmail } = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

// Registration
exports.register = async (req, res) => {
  try {
    const { username, email, password, name, contactNumber, specialization, experience } = req.body;

    // Trim and validate input
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();
    const trimmedContact = contactNumber.trim();

    // Validate required fields
    if (!trimmedEmail || !trimmedPassword || !trimmedUsername || !trimmedContact) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(trimmedPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }

    // Contact number validation
    const contactRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!contactRegex.test(trimmedContact)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid contact number"
      });
    }

    // Check if lab technician already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: trimmedEmail },
        { contactNumber: trimmedContact }
      ] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === trimmedEmail 
          ? "Email already registered" 
          : "Contact number already registered"
      });
    }

    // Create new lab technician
    const labTechnician = new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password: trimmedPassword,
      name,
      contactNumber: trimmedContact,
      specialization,
      experience,
      role: 'LabTechnician',
      isApproved: false,
      status: 'Pending',
      registrationDate: new Date()
    });

    await labTechnician.save();

    // Send email to admin
    const adminUsers = await User.find({ role: "Admin" }).select('email');
    const adminEmails = adminUsers.map(admin => admin.email);
    
    if (adminEmails.length > 0) {
      try {
        await sendEmail(
          adminEmails,
          "New Lab Technician Approval Request",
          `A new lab technician has registered and requires approval.\n\n` +
          `Name: ${name}\n` +
          `Email: ${trimmedEmail}\n` +
          `Contact: ${trimmedContact}\n` +
          `Specialization: ${specialization}\n` +
          `Experience: ${experience} years\n\n` +
          `Please review in the admin dashboard.`
        );
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail registration if email fails
      }
    }

    // Log the registration
    console.log(`New lab technician registered: ${trimmedEmail}`);

    res.status(201).json({ 
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      redirectUrl: "/awaiting-approval",
      data: {
        username: trimmedUsername,
        email: trimmedEmail
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Enhanced validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required",
        field: !email ? "email" : "password"
      });
    }

    const user = await User.findOne({ 
      email: email.trim().toLowerCase(),
      role: "LabTechnician" // Strict role check
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No lab technician account found with this email"
      });
    }

    // Debug logging
    console.log(`Login attempt for: ${user.email}`);
    console.log(`Account approved: ${user.isApproved}`);

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval",
        resolution: "Contact your administrator"
      });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
        resolution: "Reset password if forgotten"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get pending lab tests
exports.getLabRequests = async (req, res) => {
  try {
    const pendingRequests = await LabReport.find({
      status: 'Pending',
      labTechnicianId: { $exists: false }
    }).populate('patientId', 'name customId contactNumber')
      .populate('doctorId', 'name');

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching lab requests:', error);
    res.status(500).json({ message: 'Error fetching lab requests', error: error.message });
  }
};

// Update lab test result
exports.updateLabResult = async (req, res) => {
  try {
    const { testId } = req.params;
    const { result, notes, referenceRange, units } = req.body;

    // Find the lab report by ID
    const labReport = await LabReport.findById(testId);
    
    if (!labReport) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Update the lab report
    labReport.results = result;
    labReport.notes = notes || labReport.notes;
    labReport.referenceRange = referenceRange || labReport.referenceRange;
    labReport.units = units || labReport.units;
    labReport.status = 'Completed';
    labReport.labTechnicianId = req.user.id;
    labReport.updatedAt = new Date();

    await labReport.save();

    res.status(200).json({
      message: 'Lab test result updated successfully',
      report: labReport
    });
  } catch (error) {
    console.error('Error updating lab test result:', error);
    res.status(500).json({ message: 'Error updating lab test result', error: error.message });
  }
};

// Get lab technician's reports
exports.getMyReports = async (req, res) => {
  try {
    const reports = await LabReport.find({ labTechnicianId: req.user.id })
      .populate('patientId', 'name customId')
      .populate('doctorId', 'name')
      .sort({ date: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Create lab report
exports.createLabReport = async (req, res) => {
  try {
    const { patientId, testName, testType, notes, fileUrl } = req.body;

    const labReport = new LabReport({
      patientId,
      testName,
      testType,
      notes,
      fileUrl,
      doctorId: req.body.doctorId,
      labTechnicianId: req.user.id,
      status: 'Completed'
    });

    await labReport.save();

    // Update patient's lab reports
    await Patient.findByIdAndUpdate(patientId, {
      $push: { labReports: labReport._id }
    });

    res.status(201).json({
      message: 'Lab report created successfully',
      report: labReport
    });
  } catch (error) {
    console.error('Error creating lab report:', error);
    res.status(500).json({ message: 'Error creating lab report', error: error.message });
  }
};

// Update lab report
exports.updateLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { results, notes, fileUrl } = req.body;

    const labReport = await LabReport.findOneAndUpdate(
      { _id: reportId, labTechnicianId: req.user.id },
      {
        results,
        notes,
        fileUrl,
        status: 'Completed',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!labReport) {
      return res.status(404).json({ message: 'Lab report not found' });
    }

    res.status(200).json({
      message: 'Lab report updated successfully',
      report: labReport
    });
  } catch (error) {
    console.error('Error updating lab report:', error);
    res.status(500).json({ message: 'Error updating lab report', error: error.message });
  }
};

// Get lab report by ID
exports.getLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const labReport = await LabReport.findById(reportId)
      .populate('patientId', 'name customId')
      .populate('doctorId', 'name')
      .populate('labTechnicianId', 'name');

    if (!labReport) {
      return res.status(404).json({ message: 'Lab report not found' });
    }

    res.status(200).json(labReport);
  } catch (error) {
    console.error('Error fetching lab report:', error);
    res.status(500).json({ message: 'Error fetching lab report', error: error.message });
  }
};

// Get patient's lab reports
exports.getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find all lab reports for the patient
    const labReports = await LabReport.find({ patientId })
      .populate('doctorId', 'name')
      .populate('labTechnicianId', 'name')
      .sort({ date: -1 });

    res.status(200).json(labReports);
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({ message: 'Error fetching patient reports', error: error.message });
  }
};

// Upload lab report PDF (mock implementation)
exports.uploadReport = async (req, res) => {
  try {
    // In a real implementation, you would handle file upload and save the file
    // For now, just simulate success
    const { patientId } = req.body;
    // You can access the file via req.file if using multer
    res.json({ success: true, message: 'Lab report uploaded successfully', patientId });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading lab report', error: error.message });
  }
};

// Get number of unique patients served today by this lab technician
exports.getPatientsServedToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Count unique patients for lab reports completed today by this technician
    const count = await LabReport.distinct('patientId', {
      labTechnicianId: req.user.id,
      status: 'Completed',
      completedAt: { $gte: today, $lt: tomorrow }
    });

    res.json({ count: count.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients served today', error: error.message });
  }
};

// Download first prescription for a patient
exports.downloadLatestPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log(`Attempting to download prescription for patient: ${patientId}`);
    
    // Find the first prescription for the patient
    const Prescription = mongoose.model('Prescription');
    const firstPrescription = await Prescription.findOne({ patientId })
      .sort({ createdAt: 1 });
    
    console.log('Found prescription:', firstPrescription);
    
    if (!firstPrescription) {
      console.log('No prescription found for patient');
      return res.status(404).json({ 
        success: false,
        message: 'No prescription found for this patient.' 
      });
    }

    if (!firstPrescription.filePath) {
      console.log('Prescription found but no file path');
      return res.status(404).json({ 
        success: false,
        message: 'Prescription file path is missing.' 
      });
    }

    // Construct absolute file path - ensure we're looking in the uploads directory
    let filePath;
    if (firstPrescription.filePath.startsWith('/')) {
      filePath = path.join(__dirname, '..', firstPrescription.filePath);
    } else {
      filePath = path.join(__dirname, '..', 'uploads', 'prescriptions', firstPrescription.filePath);
    }
    
    console.log('Attempting to access file at:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Prescription file not found at path: ${filePath}`);
      return res.status(404).json({ 
        success: false,
        message: 'Prescription file not found on server.',
        debug: process.env.NODE_ENV === 'development' ? {
          attemptedPath: filePath,
          prescriptionId: firstPrescription._id,
          originalFilePath: firstPrescription.filePath
        } : undefined
      });
    }

    // Get patient name for the filename
    const patient = await mongoose.model('Patient').findById(patientId).select('name');
    const fileName = `${patient ? patient.name.replace(/\s+/g, '_') : patientId}_prescription.pdf`;

    console.log('Sending file:', fileName);
    
    // Set headers to prevent caching
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Send file
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error during file download:', err);
        // Only send error if headers haven't been sent yet
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
          });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading prescription:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error downloading prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 