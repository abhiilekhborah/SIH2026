import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import userAuthRoutes from "./routes/userAuthRoutes.js";
import doctorRoutes from  "./routes/doctorRoutes.js"
import patientRoutes from "./routes/patientRoutes.js"
import { errorHandler } from "./middlewares/errorHandler.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security and utility middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(morgan("dev")); // Logs HTTP requests

// Body parsing middleware
app.use(express.json());
app.use(clerkMiddleware());


// Routes
app.use("/api/v1/user", userAuthRoutes);
app.use("/api/v1/user/doctor", doctorRoutes);
app.use("/api/v1/user/patient", patientRoutes);
app.use("/api/v1/appointments",appointmentRoutes);

// Add patient routes here when you create them
// import patientRoutes from "./routes/patientRoutes.js";
// app.use("/api/v1/patient", patientRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
