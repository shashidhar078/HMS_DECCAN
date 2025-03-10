const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Doctor", "Receptionist", "Lab Technician", "Patient"], required: true },
    specialization: { type: String, default: null, required: function () { return this.role === "Doctor"; } },  // Only for doctors
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
