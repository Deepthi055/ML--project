// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB
// connectDB();

// // Initialize Express app
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Test Route
// app.get("/", (req, res) => {
//   res.send("Backend is running...");
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();
const userRoutes = require("./routes/user");

const app = express();

// Connect DB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
