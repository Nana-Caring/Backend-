const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes"); // Add user routes when needed
const User = require("./models/User");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Future user management endpoints

// Database Sync
sequelize.sync({ alter: true }) // Keeps existing data while updating schema
  .then(() => console.log("✅ Database & Models Synced Successfully"))
  .catch(err => console.error("❌ Database Sync Error:", err));

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Nana Caring API is running...");
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
