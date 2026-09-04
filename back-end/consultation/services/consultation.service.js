import { v4 as uuidv4 } from "uuid";

/**
 * Create a deterministic, safe room name from a consultation identifier.
 * If no ID is provided, a random UUID is generated.
 *
 * @param {string} [consultationId] - An existing consultation/appointment ID
 * @returns {string} Room name in the form "consultation_{id}"
 */
export function createRoomName(consultationId) {
  const id = consultationId || uuidv4();
  // Sanitise: keep only alphanumeric, hyphens, underscores
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return `consultation_${safe}`;
}

/**
 * Validate the incoming token request body.
 *
 * @param {object} body - The request body
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTokenRequest(body) {
  const { consultation_id, role, user_name } = body || {};

  if (!consultation_id || typeof consultation_id !== "string") {
    return { valid: false, error: "consultation_id is required (string)" };
  }

  if (!role || !["doctor", "patient"].includes(role)) {
    return {
      valid: false,
      error: 'role is required and must be "doctor" or "patient"',
    };
  }

  if (!user_name || typeof user_name !== "string") {
    return { valid: false, error: "user_name is required (string)" };
  }

  return { valid: true };
}
