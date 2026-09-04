import { AccessToken } from "livekit-server-sdk";
import config from "../config/consultation.config.js";

/**
 * Generate a signed LiveKit access token for a participant.
 *
 * @param {string} roomName - The LiveKit room to join
 * @param {string} participantIdentity - Unique identity for the participant
 * @param {string} participantName - Display name for the participant
 * @returns {Promise<string>} Signed JWT token
 */
export async function generateToken(
  roomName,
  participantIdentity,
  participantName
) {
  const token = new AccessToken(
    config.livekitApiKey,
    config.livekitApiSecret,
    {
      identity: participantIdentity,
      name: participantName,
      ttl: config.tokenTTL,
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return await token.toJwt();
}
