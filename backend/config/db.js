const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Connect to MongoDB using mongoose
    await mongoose.connect('mongodb://localhost:27017/hospitalDB', {
      useNewUrlParser: true,  // Use the new URL parser to avoid deprecation warnings
      useUnifiedTopology: true, // To ensure the MongoDB connection is stable
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);  // Exit the process with a failure status
  }
};

module.exports = connectDB;
