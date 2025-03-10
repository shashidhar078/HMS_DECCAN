require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const patientRoutes = require('./routes/patients');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require("./routes/staffRoutes");


const app = express();

// Middleware
app.use(cors());
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
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/staff", staffRoutes);


// Default Route
app.get('/', (req, res) => {
    res.send('Hospital Management API is Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
