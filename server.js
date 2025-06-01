const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const stripeRoutes = require('./routes/stripeRoutes');
const webhookRoutes = require('./routes/webhookRoutes'); // Ensure this is working

dotenv.config(); // Load environment variables



const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Ensure this is working
app.use(express.json()); //normal JSON parser for API requests
app.use("/api/stripe", stripeRoutes); // Ensure this is working
app.use("/api/stripe/webhook", express.raw({ type: "application/json"})) //webhook

//Test route
app.get("/", (req, res) => {
  res.send("Stripe backend is working!");
});

// Start the server 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
