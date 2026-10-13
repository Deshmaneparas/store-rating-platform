require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "An unexpected internal server error occurred." });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running smoothly on http://localhost:${PORT}`);
});
