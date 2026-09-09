/**
 * Client for the `database` service (back-end/database) — the API that owns
 * users, profiles, appointments, prescriptions and pharmacy orders.
 *
 * Distinct from `lib/consultation.ts`, which talks to the separate LiveKit
 * teleconsultation service on its own port.
 *
 * Set `EXPO_PUBLIC_API_URL` in front-end/.env. On a physical device `localhost`
 * is the phone itself, so point it at your machine's LAN address
 * (e.g. http://192.168.1.5:3000).
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Every endpoint here sits behind Clerk's `userauthenticate` middleware, which
 * reads the session token off the Authorization header.
 *
 * `getToken` only exists inside a React component (Clerk's useAuth hook), but
 * plain functions need it too — so a component registers the getter once at
 * startup and the module holds onto it. See `ApiAuthBridge` in app/_layout.tsx.
 */
type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenProvider ? await tokenProvider() : null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // Rural connectivity is the norm for this app, so name the failure plainly
    // instead of surfacing a bare "Network request failed".
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed (${response.status})`
    );
  }

  return body as T;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path);

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: 'POST',
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

export const apiPatch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, {
    method: 'PATCH',
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
