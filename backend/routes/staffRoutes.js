const express = require("express");
const { registerDoctor, doctorLogin, staffLogin } = require("../controllers/staffController");

const router = express.Router();

// Staff Login (Doctors, Receptionists, Lab Technicians)
router.post("/login", staffLogin);

// Doctor Registration (Needs Admin Approval)
router.post("/register-doctor", registerDoctor);

// Doctor Login (After Approval)
router.post("/login-doctor", doctorLogin);

module.exports = router;
