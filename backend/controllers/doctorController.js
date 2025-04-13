const User = require("../models/userModel"); // Use User model
const Patient = require("../models/patientModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Fetch patient details by customId (For Doctors)
exports.getPatientDetails = async (req, res) => {
    try {
        const { customId } = req.params;
        const patient = await Patient.findOne({ customId })
            .populate("medicalHistory.doctorId", "name specialization"); // Show doctor details in history

        if (!patient) return res.status(404).json({ message: "Patient not found" });

        res.json({ 
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            diagnosis: patient.diagnosis,
            medicalHistory: patient.medicalHistory
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get doctor notifications (Fix: Use User model instead of Doctor)
exports.getNotifications = async (req, res) => {
    try {
        const doctorId = req.user.id; // Get doctor ID from JWT
        const doctor = await User.findOne({ _id: doctorId, role: "Doctor" }); // Ensure it's a doctor

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({ notifications: doctor.notifications });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark a specific notification as read (Fix: Use User model)
exports.markNotificationAsRead = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { notificationId } = req.params;

        const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Find notification by ID and mark it as read
        const notification = doctor.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.read = true;
        await doctor.save();

        res.status(200).json({ message: "Notification marked as read", notification });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Clear all read notifications (Fix: Use User model)
exports.clearReadNotifications = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Remove only notifications that are marked as read
        doctor.notifications = doctor.notifications.filter(notification => !notification.read);
        await doctor.save();

        res.status(200).json({ message: "Read notifications cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Generate Prescription PDF (No changes required here)
exports.generatePrescriptionPDF = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ message: "Only doctors can generate prescriptions" });
    }

    const { customId } = req.params;
    const patient = await Patient.findOne({ customId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Create prescriptions directory if not exists
    const prescriptionsDir = path.join(__dirname, "../prescriptions");
    if (!fs.existsSync(prescriptionsDir)) {
      fs.mkdirSync(prescriptionsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `prescription_${customId}_${timestamp}.pdf`;
    const filePath = path.join(prescriptionsDir, fileName);

    // Create PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // PDF Content
    doc.fontSize(18).text("Medical Prescription", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Patient: ${patient.name}`);
    doc.text(`ID: ${customId}`);
    doc.text(`Age: ${patient.age || "Not specified"}`);
    doc.text(`Gender: ${patient.gender || "Not specified"}`);
    doc.moveDown();

    doc.text(`Prescribing Doctor: Dr. ${req.user.name}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    if (patient.diagnosis) {
      doc.fontSize(14).text("Diagnosis:", { underline: true });
      doc.text(patient.diagnosis);
      doc.moveDown();
    }

    doc.fontSize(14).text("Prescribed Medications:", { underline: true });
    if (patient.medications && patient.medications.length > 0) {
      patient.medications.forEach((med) => {
        doc.text(`- ${med.name}: ${med.dosage} (${med.frequency})`);
      });
    } else {
      doc.text("No medications prescribed");
    }
    doc.moveDown();

    doc.moveTo(100, doc.y).lineTo(300, doc.y).stroke();
    doc.text("Doctor Signature", 100, doc.y + 5);

    doc.end();

    await Patient.updateOne(
      { customId },
      {
        $push: {
          medicalHistory: {
            date: new Date(),
            doctorId: req.user._id,
            prescriptions: fileName,
          },
          notifications: {
            message: `New prescription from Dr. ${req.user.name}`,
            read: false,
          },
        },
      }
    );

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        fs.unlinkSync(filePath);
      }
    });
  } catch (error) {
    console.error("Prescription error:", error);
    res.status(500).json({ message: "Error generating prescription" });
  }
};
