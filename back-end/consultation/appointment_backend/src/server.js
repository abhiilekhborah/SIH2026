import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import appointmentRoutes from "./routes/consultationAppointmentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

// ── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: "*", // Rural clients, ngrok, mobile emulators & web
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "MediQuick Rural Consultation & Appointment Engine",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes Mounting ──────────────────────────────────────────────────────────
// Primary route required by SIH specifications:
app.use("/api/v1/consultation/appointments", appointmentRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Consultation endpoint not found",
  });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[AppointmentEngine Error]", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Consultation Engine Error",
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  =============================================================
  🩺 MediQuick Rural Appointment Request & Sync Engine
  📡 Active on Port: ${PORT}
  🔗 API: http://localhost:${PORT}/api/v1/consultation/appointments
  ⚡ Supabase Realtime Sync: Enabled
  =============================================================
  `);
});

export default app;
