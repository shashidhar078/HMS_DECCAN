require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const patientRoutes = require('./routes/patients');

const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require("./routes/staffRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");




//const prescriptionRoutes = require("./routes/prescriptionRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const app = express();

// Middleware

app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('MongoDB Error:', err));

// API Routes
app.use('/api/patient', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/prescriptions", prescriptionRoutes);
 // Adjust the path
app.use("/api", doctorRoutes);


// Default Route
app.get('/', (req, res) => {
    res.send('Hospital Management API is Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
