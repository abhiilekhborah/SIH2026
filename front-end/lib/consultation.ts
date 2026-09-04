const CONSULTATION_API_URL =
  process.env.EXPO_PUBLIC_CONSULTATION_API_URL || "http://localhost:5006";

export interface TokenResponse {
  success: boolean;
  room_name: string;
  token: string;
  livekit_url: string;
  message?: string;
}

/**
 * Request a LiveKit room token from the consultation backend.
 */
export async function requestConsultationToken(
  consultationId: string,
  role: "patient" | "doctor",
  userName: string
): Promise<TokenResponse> {
  const response = await fetch(
    `${CONSULTATION_API_URL}/api/v1/consultation/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consultation_id: consultationId,
        role,
        user_name: userName,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.message || `Token request failed (${response.status})`
    );
  }

  return response.json();
}

/**
 * Notify the backend that the consultation has ended.
 */
export async function endConsultationAPI(
  consultationId: string
): Promise<void> {
  try {
    await fetch(`${CONSULTATION_API_URL}/api/v1/consultation/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultation_id: consultationId }),
    });
  } catch {
    // Best-effort — don't block the user if this fails
  }
}
