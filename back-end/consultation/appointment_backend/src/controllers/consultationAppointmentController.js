import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Supabase initialization with rural-network timeouts & fallback credentials
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://rsswuxlbmdeclncxcesf.supabase.co";

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_FUqKknsYpRGhNgIdine12g_p8mXSXMO";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

/**
 * POST /api/v1/consultation/appointments/request
 * Inserts a new record into appointment_requests with status 'pending'
 */
export const createAppointmentRequest = async (req, res) => {
  try {
    const {
      doctor_id,
      patient_id,
      request_type,
      requested_date,
      requested_time,
      notes,
    } = req.body;

    // Rural validation: ensure core IDs and request type are present
    if (!doctor_id || !patient_id || !request_type) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: doctor_id, patient_id, and request_type are mandatory.",
      });
    }

    const validTypes = ["direct_teleconsultation", "scheduled_teleconsultation"];
    if (!validTypes.includes(request_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid request_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Default dates if omitted for quick-dial / direct teleconsultation
    const effectiveDate = requested_date || new Date().toISOString().split("T")[0];
    const effectiveTime =
      requested_time ||
      new Date().toTimeString().split(" ")[0].substring(0, 5);

    const payload = {
      doctor_id,
      patient_id,
      request_type,
      requested_date: effectiveDate,
      requested_time: effectiveTime,
      notes: notes || null,
      status: "pending",
      proposed_time: null,
    };

    const { data, error } = await supabase
      .from("appointment_requests")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[AppointmentEngine] DB insert error:", error);
      return res.status(500).json({
        success: false,
        error: "Database insertion failed: " + error.message,
      });
    }

    console.log(`[AppointmentEngine] Request created: ${data.id} for Doctor: ${doctor_id}`);

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully.",
      data,
    });
  } catch (err) {
    console.error("[AppointmentEngine] Controller error (request):", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error: " + err.message,
    });
  }
};

/**
 * POST /api/v1/consultation/appointments/respond
 * Doctor responds to appointment request: accept, reschedule, or reject
 */
export const respondToAppointmentRequest = async (req, res) => {
  try {
    const { appointment_request_id, id, action, proposed_time, scheduled_time } = req.body;
    const targetRequestId = appointment_request_id || id;

    if (!targetRequestId) {
      return res.status(400).json({
        success: false,
        error: "Missing appointment_request_id.",
      });
    }

    const normalizedAction = (action || "").toLowerCase().trim();
    if (!["accept", "reschedule", "reject"].includes(normalizedAction)) {
      return res.status(400).json({
        success: false,
        error: "Action must be 'accept', 'reschedule', or 'reject'.",
      });
    }

    // Fetch existing request to verify existence and extract doctor/patient info
    const { data: requestRecord, error: fetchErr } = await supabase
      .from("appointment_requests")
      .select("*")
      .eq("id", targetRequestId)
      .single();

    if (fetchErr || !requestRecord) {
      return res.status(404).json({
        success: false,
        error: "Appointment request not found: " + (fetchErr ? fetchErr.message : ""),
      });
    }

    // ── CASE 1: ACCEPT ────────────────────────────────────────────────────────
    if (normalizedAction === "accept") {
      // 1. Update request status to 'accepted'
      const { data: updatedReq, error: updateErr } = await supabase
        .from("appointment_requests")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetRequestId)
        .select()
        .single();

      if (updateErr) {
        return res.status(500).json({
          success: false,
          error: "Failed to update appointment request: " + updateErr.message,
        });
      }

      // Determine scheduled timestamp (fallback to requested_date + requested_time or current time)
      let finalScheduledTime = scheduled_time;
      if (!finalScheduledTime) {
        try {
          const datePart = requestRecord.requested_date || new Date().toISOString().split("T")[0];
          const timePart = requestRecord.requested_time || "10:00:00";
          finalScheduledTime = new Date(`${datePart}T${timePart}`).toISOString();
        } catch (_) {
          finalScheduledTime = new Date().toISOString();
        }
      }

      // 2. Insert corresponding row into appointments
      const appointmentPayload = {
        appointment_request_id: targetRequestId,
        doctor_id: requestRecord.doctor_id,
        patient_id: requestRecord.patient_id,
        scheduled_at: finalScheduledTime,
        status: "scheduled",
        mode: requestRecord.request_type?.includes("teleconsultation") ? "video" : "in_person",
        booked_by: "patient",
      };

      const { data: newAppt, error: apptErr } = await supabase
        .from("appointments")
        .insert(appointmentPayload)
        .select()
        .single();

      if (apptErr) {
        console.warn("[AppointmentEngine] Appointment row warning:", apptErr.message);
      }

      console.log(`[AppointmentEngine] Request ${targetRequestId} ACCEPTED. Created appt: ${newAppt?.id}`);

      return res.status(200).json({
        success: true,
        action: "accept",
        status: "accepted",
        request: updatedReq,
        appointment: newAppt || null,
      });
    }

    // ── CASE 2: RESCHEDULE ────────────────────────────────────────────────────
    if (normalizedAction === "reschedule") {
      if (!proposed_time) {
        return res.status(400).json({
          success: false,
          error: "proposed_time (TIMESTAMPTZ) is required for rescheduling.",
        });
      }

      const { data: updatedReq, error: updateErr } = await supabase
        .from("appointment_requests")
        .update({
          status: "rescheduled",
          proposed_time: new Date(proposed_time).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetRequestId)
        .select()
        .single();

      if (updateErr) {
        return res.status(500).json({
          success: false,
          error: "Failed to reschedule appointment request: " + updateErr.message,
        });
      }

      console.log(`[AppointmentEngine] Request ${targetRequestId} RESCHEDULED to ${proposed_time}`);

      return res.status(200).json({
        success: true,
        action: "reschedule",
        status: "rescheduled",
        request: updatedReq,
      });
    }

    // ── CASE 3: REJECT ────────────────────────────────────────────────────────
    if (normalizedAction === "reject") {
      const { data: updatedReq, error: updateErr } = await supabase
        .from("appointment_requests")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetRequestId)
        .select()
        .single();

      if (updateErr) {
        return res.status(500).json({
          success: false,
          error: "Failed to reject appointment request: " + updateErr.message,
        });
      }

      console.log(`[AppointmentEngine] Request ${targetRequestId} REJECTED.`);

      return res.status(200).json({
        success: true,
        action: "reject",
        status: "rejected",
        request: updatedReq,
      });
    }
  } catch (err) {
    console.error("[AppointmentEngine] Controller error (respond):", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error: " + err.message,
    });
  }
};

/**
 * GET /api/v1/consultation/appointments/doctor/:doctorId
 * Fetch active requests for doctor (used for initial load and rural reconnection fallback)
 */
export const getDoctorRequests = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { data, error } = await supabase
      .from("appointment_requests")
      .select(`
        *,
        patient:patient_profiles (*)
      `)
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/v1/consultation/appointments/patient/:patientId
 * Fetch patient's latest appointment request status
 */
export const getPatientRequests = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { data, error } = await supabase
      .from("appointment_requests")
      .select(`
        *,
        doctor:doctor_profiles (*)
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
