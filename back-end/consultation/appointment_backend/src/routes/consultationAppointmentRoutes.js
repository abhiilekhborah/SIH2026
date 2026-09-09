import express from "express";
import {
  createAppointmentRequest,
  respondToAppointmentRequest,
  getDoctorRequests,
  getPatientRequests,
} from "../controllers/consultationAppointmentController.js";

const router = express.Router();

/**
 * POST /api/v1/consultation/appointments/request
 * Submits a new appointment request (status = 'pending')
 */
router.post("/request", createAppointmentRequest);

/**
 * POST /api/v1/consultation/appointments/respond
 * Doctor accepts, reschedules, or rejects an incoming request
 */
router.post("/respond", respondToAppointmentRequest);

/**
 * GET /api/v1/consultation/appointments/doctor/:doctorId
 * Fetches requests for a doctor (rural fallback & initial fetch)
 */
router.get("/doctor/:doctorId", getDoctorRequests);

/**
 * GET /api/v1/consultation/appointments/patient/:patientId
 * Fetches requests for a patient (rural fallback & status check)
 */
router.get("/patient/:patientId", getPatientRequests);

export default router;
