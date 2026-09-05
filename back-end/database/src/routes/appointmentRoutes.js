import express from "express"
const router =express.Router();

import { userauthenticate } from "../middlewares/authenticate.js";
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";




// ===============================
// Patient routes
// ===============================

// Book appointment
router.post("/", userauthenticate, bookAppointment);

// Get logged-in patient's appointments
router.get("/my", userauthenticate, getMyAppointments);

// Get single appointment
router.get("/:id", userauthenticate, getAppointmentById);

// Cancel appointment
router.patch("/:id/cancel", userauthenticate, cancelAppointment);


// ===============================
// Doctor routes
// ===============================

// Get doctor's appointments
router.get("/doctor", userauthenticate, getDoctorAppointments);

// Update appointment status
router.patch("/:id/status", userauthenticate, updateAppointmentStatus);











export default router ;