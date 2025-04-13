const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Patient", 
      required: true 
    },
    date: { 
      type: Date, 
      required: true,
      validate: {
        validator: function(value) {
          return value > new Date();
        },
        message: "Appointment date must be in the future"
      }
    },
    status: { 
      type: String, 
      enum: ["Scheduled", "Completed", "Cancelled"], 
      default: "Scheduled" 
    },
    prescription: { 
      type: String, 
      default: "" 
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Add virtual population
appointmentSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

appointmentSchema.virtual('patient', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;