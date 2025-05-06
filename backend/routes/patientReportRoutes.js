const express = require("express");
const router = express.Router();
const labController = require("../controllers/labController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Get patient's lab reports
router.get("/:patientId", verifyToken, labController.getPatientReports);

module.exports = router; 