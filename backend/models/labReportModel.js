const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testType: {
    type: String,
    required: true,
    enum: [
      'Blood Test',
      'Urine Test',
      'X-Ray',
      'MRI',
      'CT Scan',
      'ECG',
      'Ultrasound',
      'Biopsy',
      'Other'
    ],
    default: 'Blood Test'
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  results: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    trim: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  labTechnicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'Completed';
    }
  },
  testParameters: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    referenceRange: {
      type: String,
      required: true
    }
  }],
  isNormal: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['Normal', 'Urgent', 'Emergency'],
    default: 'Normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
labReportSchema.index({ patientId: 1, date: -1 });
labReportSchema.index({ doctorId: 1, date: -1 });
labReportSchema.index({ status: 1 });
labReportSchema.index({ labTechnicianId: 1, date: -1 });

// Pre-save middleware to update isNormal based on test parameters
labReportSchema.pre('save', function(next) {
  if (this.testParameters && this.testParameters.length > 0) {
    // Check if any parameter is outside reference range
    this.isNormal = this.testParameters.every(param => {
      const [min, max] = param.referenceRange.split('-').map(Number);
      const value = Number(param.value);
      return value >= min && value <= max;
    });
  }
  next();
});

const LabReport = mongoose.model('LabReport', labReportSchema);

module.exports = LabReport; 