const Patient = require("../models/patientModel"); // To verify patient existence
const User = require("../models/staffModel"); // Import staffModel instead of doctorModel
const Appointment = require("../models/appointmentModel");

// 📌 Book an Appointment


// Constants for IST (UTC+5:30)
const IST_OFFSET = 330 * 60 * 1000; // 5h30m in milliseconds
const OPENING_HOUR = 9; // 9 AM IST
const CLOSING_HOUR = 21; // 9 PM IST

// Helper function to convert to IST
const convertToIST = (date) => {
  return new Date(date.getTime() + IST_OFFSET);
};

// 📌 Book an Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date } = req.body;

    // 1. Validate input date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // 2. Convert to IST and validate
    const istDate = convertToIST(appointmentDate);
    
    // Check if date is in past
    if (istDate < convertToIST(new Date())) {
      return res.status(400).json({ message: "Cannot book appointments in the past" });
    }

    // Check business hours (9AM-9PM IST)
    const hours = istDate.getHours();
    if (hours < OPENING_HOUR || hours >= CLOSING_HOUR) {
      return res.status(400).json({ 
        message: `Appointments available only between ${OPENING_HOUR}:00 to ${CLOSING_HOUR}:00 IST`
      });
    }

    // 3. Validate doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 4. Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 5. Check for existing appointments (IST day)
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      patientId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      },
      status: { $ne: "Cancelled" }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "You already have an appointment with this doctor today" });
    }

    // 6. Create appointment
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      date: appointmentDate,
      status: "Scheduled"
    });

    await newAppointment.save();

    // 7. Add notifications
    await User.findByIdAndUpdate(doctorId, {
      $push: {
        notifications: {
          message: `New appointment with ${patient.name} at ${istDate.getHours()}:${istDate.getMinutes().toString().padStart(2, '0')}`,
          read: false,
          type: "appointment",
          appointmentId: newAppointment._id
        }
      }
    });

    await Patient.findByIdAndUpdate(patientId, {
      $push: {
        notifications: {
          message: `Appointment booked with Dr. ${doctor.username} at ${istDate.getHours()}:${istDate.getMinutes().toString().padStart(2, '0')}`,
          read: false,
          type: "appointment",
          appointmentId: newAppointment._id
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: {
        ...newAppointment.toObject(),
        istTime: istDate.toISOString()
      }
    });

  } catch (error) {
    console.error("Appointment booking error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// [Rest of the controller methods remain the same...]
// 📌 Get Doctor's Appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await User.findOne({ _id: doctorId, role: "Doctor" });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    const appointments = await Appointment.find({ doctorId }).populate("patientId", "name age gender");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get Patient's Appointments (🔹 ADDED THIS METHOD)
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate patient existence
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found!" });
    }

    // Fetch all appointments for this patient
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "username specialization")
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Mark Appointment as Completed
exports.completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found!" });
    }

    appointment.status = "Completed";
    await appointment.save();
    res.status(200).json({ message: "Appointment marked as completed!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
