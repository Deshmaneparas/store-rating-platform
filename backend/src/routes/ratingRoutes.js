const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Only normal users can rate stores
router.post(
  "/",
  authenticateToken,
  requireRole("USER"),
  ratingController.submitOrUpdateRating
);

module.exports = router;
