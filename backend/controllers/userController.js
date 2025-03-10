const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");  // JWT for authentication

// Function to validate password strength
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// User Registration Function
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Weak password! It must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered." });
    }

    // Create new user (Password will be hashed automatically in userModel.js)
    const newUser = new User({ username, email, password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Admin Login Function
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If no user is found
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is an admin
    if (user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a JWT token for the admin
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,  // You should set a JWT_SECRET in your .env file
      { expiresIn: "1h" }
    );

    // Send the response with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { registerUser, adminLogin };
