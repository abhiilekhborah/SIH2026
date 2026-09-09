import { generateToken } from "../services/livekit.service.js";
import {
  createRoomName,
  validateTokenRequest,
} from "../services/consultation.service.js";
import config from "../config/consultation.config.js";

/**
 * POST /api/v1/consultation/token
 *
 * Generate a LiveKit access token for the requesting participant.
 */
export async function getToken(req, res, next) {
  try {
    const validation = validateTokenRequest(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { consultation_id, role, user_name } = req.body;

    const roomName = createRoomName(consultation_id);

    // Identity must be unique per participant in a room
    const participantIdentity = `${role}_${consultation_id}`;

    const token = await generateToken(
      roomName,
      participantIdentity,
      user_name
    );

    return res.status(200).json({
      success: true,
      room_name: roomName,
      token,
      livekit_url: config.livekitUrl,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/consultation/end
 *
 * Acknowledge consultation end. Lightweight cleanup endpoint.
 */
export async function endConsultation(req, res, next) {
  try {
    const { consultation_id } = req.body || {};

    if (!consultation_id) {
      return res.status(400).json({
        success: false,
        message: "consultation_id is required",
      });
    }

    // In a production system you would persist the end-time, update status, etc.
    // For now this is a lightweight acknowledgment endpoint.
    return res.status(200).json({
      success: true,
      message: "Consultation ended successfully",
    });
  } catch (err) {
    next(err);
  }
}
