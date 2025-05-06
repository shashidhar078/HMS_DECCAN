// authMiddleware.js
const jwt = require("jsonwebtoken");

// Middleware to verify general users (doctors/patients)
exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to verify ONLY admins
exports.verifyAdmin = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "Admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to verify ONLY receptionists
exports.verifyReceptionist = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "Receptionist") {
            return res.status(403).json({ message: "Receptionist access required" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to verify ONLY lab technicians
exports.verifyLabTechnician = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "Lab Technician") {
            return res.status(403).json({ message: "Lab Technician access required" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Middleware to verify token (general purpose)
exports.verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Role restriction middleware
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `You do not have permission to perform this action`
            });
        }
        next();
    };
};