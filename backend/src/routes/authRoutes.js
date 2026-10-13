const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.put("/update-password", authenticateToken, authController.updatePassword);
router.get("/me", authenticateToken, authController.getMe);

module.exports = router;
