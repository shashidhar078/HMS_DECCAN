const express = require("express");
const { verifyAdmin } = require("../middlewares/authMiddleware");
const { adminLogin, getPendingStaff, approveStaff, rejectStaff , getAllUsers } = require("../controllers/adminController");

const router = express.Router();

router.post("/login", adminLogin);
router.get("/pending-staff", getPendingStaff);
router.post("/approve-staff", approveStaff);
router.post("/reject-staff", rejectStaff);
router.get("/users", verifyAdmin, getAllUsers);

module.exports = router;
