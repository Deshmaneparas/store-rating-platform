const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { authenticateToken, optionalAuth, requireRole } = require("../middleware/auth");

// Public / normal user listing with optional auth to show user's submitted rating
router.get("/", optionalAuth, storeController.getStores);

// Store owner specific dashboard
router.get(
  "/owner-dashboard",
  authenticateToken,
  requireRole("STORE_OWNER"),
  storeController.getStoreOwnerDashboard
);

module.exports = router;
