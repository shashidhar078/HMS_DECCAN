const mongoose = require('mongoose'); 
const patientSchema = new mongoose.Schema({
    customId: {
      type: String,
      required: false,
      unique: true,  // Ensure it's unique
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
  });
  
  patientSchema.pre('save', async function (next) {
    if (this.isNew) {
        // Generate a custom ID based on timestamp and random number
        this.customId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Check if the customId already exists (this can be optimized further)
        const existingPatient = await mongoose.model('Patient').findOne({ customId: this.customId });
        if (existingPatient) {
            // If the generated customId exists, regenerate it
            this.customId = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
    }
    next();
});
  // Create a model
  const Patient = mongoose.model("Patient", patientSchema);
  module.exports = Patient;
  