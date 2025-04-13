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