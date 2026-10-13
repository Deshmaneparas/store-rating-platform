const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, requireRole } = require("../middleware/auth");

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole("ADMIN"));

router.get("/dashboard-stats", adminController.getDashboardStats);
router.post("/users", adminController.createUser);
router.post("/stores", adminController.createStore);
router.get("/users", adminController.getUsers);
router.get("/stores", adminController.getStores);

module.exports = router;
