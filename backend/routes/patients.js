const express = require("express");
const router = express.Router();
const Patient = require("../models/patientModel");
// const { getPatientDetails } = require("../controllers/patientController");
const { generateOtpHandler, verifyOtpHandler, testSmsHandler } = require("../controllers/patientController");
const verifyDoctor = require("../middlewares/verifyDoctor");
const sendSMS = require("../utils/sendSms"); // Import your SMS utility
const jwt = require("jsonwebtoken");
require("dotenv").config();


// Create a new patient (only Admin can add patients)
router.post("/login-patient", async (req, res) => {
  const { name, email, contactNumber } = req.body;

  try {
    if (!name || !email || !contactNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let patient = await Patient.findOne({ contactNumber });

    // If patient does not exist, create a new one
    if (!patient) {
      patient = new Patient({ name, email, contactNumber });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    patient.otp = otp;
    patient.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await patient.save();

    // Send OTP via SMS
    const otpSent = await sendSMS(contactNumber, `Your OTP for login is: ${otp}`);
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { contactNumber, otp } = req.body;

  try {
    if (!contactNumber || !otp) {
      return res.status(400).json({ message: "Contact number and OTP are required" });
    }

    const patient = await Patient.findOne({ contactNumber });

    if (!patient || patient.otp !== otp || new Date() > patient.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Assign a custom ID if not already assigned
    if (!patient.customId) {
      patient.customId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Clear OTP fields after verification
    patient.otp = null;
    patient.otpExpiry = null;
    await patient.save();

    // Send CustomID via SMS (ADD THIS)
    const smsSent = await sendSMS(
      contactNumber, 
      `Your Hospital ID: ${patient.customId}`
    );
    console.log('SMS send status:', smsSent ? 'Success' : 'Failed');

    // Generate JWT Token
    const token = jwt.sign(
      { id: patient._id, customId: patient.customId }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      customId: patient.customId,
      smsSent: smsSent // Add this to response
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
router.post("/generate-otp", generateOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.put("/update-profile", async (req, res) => {
  try {
      const { age, gender, address, emergencyContact, allergies } = req.body;
      const patientId = req.user.id; // Extracted from authMiddleware
      
      // Find the patient by their ID
      const patient = await Patient.findById(patientId);
      if (!patient) {
          return res.status(404).json({ success: false, message: "Patient not found" });
      }
      
      // Update only provided fields
      if (age) patient.age = age;
      if (gender) patient.gender = gender;
      if (address) patient.address = address;
      if (emergencyContact) patient.emergencyContact = emergencyContact;
      if (allergies) patient.allergies = allergies;

      // Save updated patient profile
      await patient.save();

      res.json({ success: true, message: "Profile updated successfully", patient });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Add this with your other routes
router.get('/test-sms', testSmsHandler);
// Get patient details by customId or contactNumber
router.get("/get-patient", verifyDoctor, async (req, res) => {
  try {
      const { customId } = req.query;  // Get customId from query params

      if (!customId) {
          return res.status(400).json({ message: "Custom ID is required" });
      }

      const patient = await Patient.findOne({ customId }).select("-otp -otpExpiry"); // Exclude OTP fields

      if (!patient) {
          return res.status(404).json({ message: "Patient not found" });
      }

      res.status(200).json({
          message: "Patient details retrieved successfully",
          patient
      });
  } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
  }
});


module.exports = router;
