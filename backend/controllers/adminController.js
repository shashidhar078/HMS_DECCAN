const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("../middlewares/authMiddleware");

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin in the "users" collection with role "Admin"
        const admin = await User.findOne({ email, role: "Admin" });
        console.log("Admin from DB:", admin);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Verify the hashed password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token for authentication
        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            }
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Pending Staff for Approval (Doctors, Receptionists, Lab Technicians)
const getPendingStaff = async (req, res) => {
    try {
        const pendingUsers = await User.find({ isApproved: false, role: { $in: ["Doctor", "Receptionist", "LabTechnician"] } });
        res.status(200).json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve Staff by Admin
const approveStaff = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update approval status
        user.isApproved = true;
        await user.save();

        res.status(200).json({ message: `${user.role} approved successfully` });

    } catch (error) {
        console.error("Error approving staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Reject Staff by Admin
const rejectStaff = async (req, res) => {
    try {
        const { userId } = req.body;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: `${user.role} rejected and removed` });

    } catch (error) {
        console.error("Error rejecting staff:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users except Admin
        const users = await User.find({ role: { $ne: "Admin" } });

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const registerStaff = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Allowed roles for staff
        const allowedRoles = ["Doctor", "Receptionist", "LabTechnician"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new staff user (pending approval)
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
            isApproved: false, // User needs admin approval
        });

        await newUser.save();

        res.status(201).json({ message: "Registration successful. Awaiting admin approval." });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { adminLogin, getPendingStaff, approveStaff, rejectStaff , getAllUsers};
