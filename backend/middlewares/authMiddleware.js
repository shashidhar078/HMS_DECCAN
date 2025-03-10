const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header

    if (!token) return res.status(403).json({ message: "Access denied, no token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        if (decoded.role !== "Admin") return res.status(403).json({ message: "Access denied, not an admin" });

        req.user = decoded;  // Attach decoded token info to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { verifyAdmin };
