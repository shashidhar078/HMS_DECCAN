const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ["Admin", "Doctor", "Receptionist", "Lab Technician", "Patient"], 
        required: true 
    },
    specialization: { 
        type: String, 
        default: null, 
        required: function () { return this.role === "Doctor"; } 
    },
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    notifications: [
        {
            message: String,
            timestamp: { type: Date, default: Date.now },
            read: { type: Boolean, default: false }
        }
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
    
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;