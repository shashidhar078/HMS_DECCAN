const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel');

// Create a new patient
router.post('/add', async (req, res) => {
    const { name, age, gender, diagnosis } = req.body;

    const newPatient = new Patient({
        name,
        age,
        gender,
        diagnosis,
    });

    try {
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all patients
router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single patient by ID
router.get("/custom/:customId", async (req, res) => {
  try {
    const patient = await Patient.findOne({ customId: req.params.customId });  // Search by customId
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);  // Send the patient data as a response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// Update a patient's details
// Update a patient's details by customId
router.put('/custom/:customId', async (req, res) => {
  try {
    // Use customId instead of id
    const updatedPatient = await Patient.findOneAndUpdate(
      { customId: req.params.customId },  // Match patient by customId
      req.body,  // Update with the request body data
      { new: true }  // Return the updated patient
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(updatedPatient);  // Send the updated patient data as a response
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete a patient
// Delete a patient by customId
router.delete('/custom/:customId', async (req, res) => {
  try {
    // Find and delete the patient using customId
    const deletedPatient = await Patient.findOneAndDelete({ customId: req.params.customId });
    
    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: 'Patient deleted successfully', deletedPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
