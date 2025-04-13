const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Staff Login Function (For all staff roles)
const staffLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trim and validate input
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email: trimmedEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is approved
        if (!user.isApproved) {
            return res.status(403).json({ message: "Approval pending. Please wait for admin approval." });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(trimmedPassword, user.password);
        console.log("Entered password:", trimmedPassword); // Debugging
        console.log("Hashed password in DB:", user.password); // Debugging
        console.log("Password match:", isMatch); // Debugging

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("Staff Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Register a Doctor (Requires Admin Approval)
const registerDoctor = async (req, res) => {
    try {
        const { username, email, password, specialization } = req.body;

        // Trim and validate input
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if doctor already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Doctor already registered" });
        }

        // Create new doctor (Approval Pending)
        const newDoctor = new User({
            username,
            email: trimmedEmail,
            password: trimmedPassword, // Save the plain-text password
            role: "Doctor",
            specialization,
            isApproved: false, // Needs admin approval
        });

        await newDoctor.save();
        res.status(201).json({ message: "Registration successful. Awaiting admin approval." });

    } catch (error) {
        console.error("Doctor Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Doctor Login (Only if Approved)
const doctorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trim and validate input
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find doctor in DB
        const doctor = await User.findOne({ email: trimmedEmail, role: "Doctor" });

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Check if approved by Admin
        if (!doctor.isApproved) {
            return res.status(403).json({ message: "Approval pending. Please wait for admin approval." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(trimmedPassword, doctor.password);
        console.log("Entered password:", trimmedPassword); // Debugging
        console.log("Hashed password in DB:", doctor.password); // Debugging
        console.log("Password match:", isMatch); // Debugging

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: doctor._id, role: doctor.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            doctor: {
                id: doctor._id,
                username: doctor.username,
                email: doctor.email,
                role: doctor.role,
            }
        });

    } catch (error) {
        console.error("Doctor Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { staffLogin, registerDoctor, doctorLogin };