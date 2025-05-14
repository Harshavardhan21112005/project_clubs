const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Redis Connection
require("./config/redis");

// Routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const clubRoutes = require("./routes/clubRoutes");
const eventRoutes = require("./routes/eventRoutes");

// Route mounting
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);

// Global Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
