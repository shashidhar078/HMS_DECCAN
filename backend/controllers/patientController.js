const Patient = require("../models/patientModel");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendSms = require("../utils/sendSms"); // Import your SMS utility
dotenv.config();

// Validate environment variables
const validateEnv = () => {
    const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

try {
    validateEnv();
} catch (error) {
    console.error('❌ Environment configuration error:', error.message);
    process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (patient) => {
    return jwt.sign(
        { 
            id: patient._id, 
            customId: patient.customId,
            role: 'patient'
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: "7d",
            issuer: 'hospital-management-system'
        }
    );
};

// Generate and send OTP
const generateOtpHandler = async (req, res) => {
    try {
      const { contactNumber } = req.body;
  
      // Generate and save OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // ... save to database ...
  
      // Send OTP via SMS
      const otpMessage = `Your Hospital login OTP is: ${otp}`;
      const smsSent = await sendSms(contactNumber, otpMessage);
  
      if (!smsSent) {
        return res.status(500).json({ 
          success: false,
          message: "Failed to send OTP via SMS" 
        });
      }
  
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("OTP generation error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  const verifyOtpHandler = async (req, res) => {
    try {
        const { contactNumber, otp } = req.body;

        // 1. Verify OTP
        const patient = await Patient.findOne({ contactNumber });
        if (!patient || patient.otp !== otp || new Date() > patient.otpExpiry) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired OTP" 
            });
        }

        // 2. Ensure CustomID exists (create if missing)
        if (!patient.customId) {
            patient.customId = `PAT-${Date.now().toString(36).toUpperCase()}`;
        }

        // 3. Clear OTP fields
        patient.otp = undefined;
        patient.otpExpiry = undefined;
        patient.lastLogin = new Date();
        await patient.save();

        // 4. ALWAYS send CustomID via SMS
        const customIdMessage = `Your Hospital ID: ${patient.customId}`;
        const smsSent = await sendSms(contactNumber, customIdMessage);
        
        console.log(smsSent ? "CustomID SMS sent" : "Failed to send SMS");

        // 5. Respond with token and ID
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            token: generateToken(patient),
            customId: patient.customId,
            smsSent: smsSent
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error"
        });
    }
};
  // Add this with your other routes
  const testSmsHandler = async (req, res) => {
    try {
      // Replace with your actual mobile number (without +91)
      const testNumber = "8919621062"; // Example: 9876543210 with 91 prefix
      const testMessage = "Test SMS from Hospital System";
      
      const success = await sendSms(testNumber, testMessage);
      
      res.json({ 
        success,
        message: success ? "Test SMS sent successfully" : "Failed to send test SMS",
        number: testNumber
      });
    } catch (error) {
      console.error("Test SMS failed:", error);
      res.status(500).json({ 
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

module.exports = { 
    generateOtpHandler, 
    verifyOtpHandler,
    testSmsHandler
};