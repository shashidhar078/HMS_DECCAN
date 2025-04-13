const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    customId: {
        type: String,
        unique: true,
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    contactNumber: {
        type: String,
        unique: true,
        required: true,
    },
    age: {
        type: Number,
        required: false,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    emergencyContact: {
        name: { type: String, required: false },
        relation: { type: String, required: false },
        contactNumber: { type: String, required: false },
    },
    admissionDate: {
        type: Date,
        default: Date.now,
    },
    dischargeDate: {
        type: Date,
    },
    doctorAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    diagnosis: {
        type: String,
    },
    medicalHistory: [
        {
          date: { type: Date, default: Date.now },
          doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          diagnosis: { type: String },
          prescriptions: { type: String }, // Stores PDF filename
          notes: { type: String }
        }
      ],
    labReports: [
        {
            testName: { type: String },
            result: { type: String },
            date: { type: Date, default: Date.now },
        },
    ],
    medications: [
        {
            name: { type: String, required: false },
            dosage: { type: String, required: false },
            frequency: { type: String, required: false },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
        },
    ],
    allergies: {
        type: [String],
        default: [],
    },
    billing: {
        totalBill: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ["Paid", "Pending", "Partially Paid"],
            default: "Pending",
        },
    },
    appointments: [
        {
            doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            date: { type: Date, required: false },
            status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
        },
    ],
    
    otp: {
        type: String,
        required: false,
    },
    otpExpiry: {
        type: Date,
        required: false,
    },
});

// Generate unique custom ID before saving
patientSchema.pre("save", async function (next) {
    if (this.isNew) {
        let isUnique = false;
        let newCustomId = "";

        while (!isUnique) {
            newCustomId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const existingPatient = await mongoose.model("Patient").findOne({ customId: newCustomId });
            if (!existingPatient) {
                isUnique = true;
            }
        }

        this.customId = newCustomId;
    }
    next();
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
