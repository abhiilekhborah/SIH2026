import { useEffect, useRef, useState, useCallback } from "react";
// Polyfill DOMException for React Native before livekit-client is imported
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'DOMException';
    }
  } as any;
}

import type {
  RemoteParticipant,
  RemoteTrackPublication,
  RoomOptions,
  LocalTrack,
} from "livekit-client";

// The polyfill must run before livekit-client is evaluated
const {
  Room,
  RoomEvent,
  Track,
  ConnectionQuality,
  ConnectionState,
  VideoPresets,
} = require("livekit-client");

// ── Types ────────────────────────────────────────────────────────────────────

interface UseConsultationOptions {
  url: string;
  token: string;
}

interface ConsultationState {
  /** Current connection state */
  connectionState: ConnectionState;
  /** Local connection quality */
  connectionQuality: ConnectionQuality;
  /** Whether the local microphone is enabled */
  isAudioEnabled: boolean;
  /** Whether the local camera is enabled */
  isVideoEnabled: boolean;
  /** Whether video was auto-paused due to poor connection */
  isVideoAutoPaused: boolean;
  /** The remote participant (doctor or patient) */
  remoteParticipant: RemoteParticipant | null;
  /** Remote participant's video track */
  remoteVideoTrack: RemoteTrackPublication | null;
  /** Remote participant's audio track */
  remoteAudioTrack: RemoteTrackPublication | null;
  /** Local video track for preview */
  localVideoTrack: LocalTrack | null;
  /** User-facing error message */
  error: string | null;
  /** Whether currently connecting */
  isConnecting: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Milliseconds to wait before auto-pausing/resuming video (prevents flapping) */
const QUALITY_COOLDOWN_MS = 10_000;

/** Room connection options optimized for low-bandwidth rural networks */
const ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  publishDefaults: {
    videoEncoding: {
      maxBitrate: 150_000, // ~150kbps max for 320×240
      maxFramerate: 15,
    },
    dtx: true, // Discontinuous transmission — saves bandwidth on silence
    red: true, // Redundant encoding — helps with packet loss
  },
  videoCaptureDefaults: {
    resolution: VideoPresets.h180.resolution, // 320×180 — very lightweight
  },
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useConsultation(options?: UseConsultationOptions) {
  const roomRef = useRef<Room | null>(null);
  const qualityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasVideoEnabledRef = useRef(false);

  const [state, setState] = useState<ConsultationState>({
    connectionState: ConnectionState.Disconnected,
    connectionQuality: ConnectionQuality.Unknown,
    isAudioEnabled: false,
    isVideoEnabled: false,
    isVideoAutoPaused: false,
    remoteParticipant: null,
    remoteVideoTrack: null,
    remoteAudioTrack: null,
    localVideoTrack: null,
    error: null,
    isConnecting: false,
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const updateRemoteTracks = useCallback((participant: RemoteParticipant) => {
    let videoTrack: RemoteTrackPublication | null = null;
    let audioTrack: RemoteTrackPublication | null = null;

    participant.trackPublications.forEach((pub) => {
      if (pub.kind === Track.Kind.Video && pub.track) {
        videoTrack = pub;
      }
      if (pub.kind === Track.Kind.Audio && pub.track) {
        audioTrack = pub;
      }
    });

    setState((s) => ({
      ...s,
      remoteVideoTrack: videoTrack,
      remoteAudioTrack: audioTrack,
    }));
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    if (!options?.url || !options?.token) return;

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      // Create room if it doesn't exist yet
      if (!roomRef.current) {
        roomRef.current = new Room(ROOM_OPTIONS);
      }

      const room = roomRef.current;

      // ── Room Events ────────────────────────────────────────────────────

      room.on(RoomEvent.ConnectionStateChanged, (connectionState: ConnectionState) => {
        setState((s) => ({ ...s, connectionState }));
      });

      room.on(
        RoomEvent.ConnectionQualityChanged,
        (quality: ConnectionQuality) => {
          setState((s) => ({ ...s, connectionQuality: quality }));

          // Auto-pause video on poor connection
          if (quality === ConnectionQuality.Poor) {
            if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);

            qualityTimerRef.current = setTimeout(async () => {
              const currentRoom = roomRef.current;
              if (!currentRoom) return;

              const lp = currentRoom.localParticipant;
              const videoEnabled = lp.isCameraEnabled;

              if (videoEnabled) {
                wasVideoEnabledRef.current = true;
                await lp.setCameraEnabled(false);
                setState((s) => ({
                  ...s,
                  isVideoEnabled: false,
                  isVideoAutoPaused: true,
                }));
              }
            }, QUALITY_COOLDOWN_MS);
          }

          // Re-enable video when quality recovers
          if (
            quality === ConnectionQuality.Good ||
            quality === ConnectionQuality.Excellent
          ) {
            if (qualityTimerRef.current) {
              clearTimeout(qualityTimerRef.current);
              qualityTimerRef.current = null;
            }

            if (wasVideoEnabledRef.current) {
              wasVideoEnabledRef.current = false;
              setTimeout(async () => {
                const currentRoom = roomRef.current;
                if (!currentRoom) return;
                await currentRoom.localParticipant.setCameraEnabled(true);
                setState((s) => ({
                  ...s,
                  isVideoEnabled: true,
                  isVideoAutoPaused: false,
                }));
              }, QUALITY_COOLDOWN_MS);
            } else {
              setState((s) => ({ ...s, isVideoAutoPaused: false }));
            }
          }
        }
      );

      room.on(
        RoomEvent.ParticipantConnected,
        (participant: RemoteParticipant) => {
          setState((s) => ({ ...s, remoteParticipant: participant }));

          participant.on("trackSubscribed", () => {
            updateRemoteTracks(participant);
          });
          participant.on("trackUnsubscribed", () => {
            updateRemoteTracks(participant);
          });
        }
      );

      room.on(
        RoomEvent.ParticipantDisconnected,
        () => {
          setState((s) => ({
            ...s,
            remoteParticipant: null,
            remoteVideoTrack: null,
            remoteAudioTrack: null,
          }));
        }
      );

      room.on(
        RoomEvent.TrackSubscribed,
        (_track, publication, participant) => {
          setState((s) => ({ ...s, remoteParticipant: participant }));
          updateRemoteTracks(participant);
        }
      );

      room.on(
        RoomEvent.TrackUnsubscribed,
        (_track, _publication, participant) => {
          updateRemoteTracks(participant);
        }
      );

      room.on(RoomEvent.Disconnected, () => {
        setState((s) => ({
          ...s,
          connectionState: ConnectionState.Disconnected,
          remoteParticipant: null,
          remoteVideoTrack: null,
          remoteAudioTrack: null,
          localVideoTrack: null,
          isAudioEnabled: false,
          isVideoEnabled: false,
        }));
      });

      // ── Actually connect ─────────────────────────────────────────────

      await room.connect(options.url, options.token);

      // Start with audio only (voice call by default)
      await room.localParticipant.setMicrophoneEnabled(true);

      // Check for already-connected participants
      room.remoteParticipants.forEach((participant) => {
        setState((s) => ({ ...s, remoteParticipant: participant }));
        participant.on("trackSubscribed", () =>
          updateRemoteTracks(participant)
        );
        participant.on("trackUnsubscribed", () =>
          updateRemoteTracks(participant)
        );
        updateRemoteTracks(participant);
      });

      setState((s) => ({
        ...s,
        isConnecting: false,
        isAudioEnabled: true,
        connectionState: ConnectionState.Connected,
      }));
    } catch (err: any) {
      console.error("LiveKit connect error:", err);
      setState((s) => ({
        ...s,
        isConnecting: false,
        error:
          err?.message || "Unable to start consultation. Please check your connection.",
      }));
    }
  }, [options?.url, options?.token, updateRemoteTracks]);

  // ── Controls ─────────────────────────────────────────────────────────────

  const toggleAudio = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      const next = !room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(next);
      setState((s) => ({ ...s, isAudioEnabled: next }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Microphone permission is required for voice calls.",
      }));
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      const next = !room.localParticipant.isCameraEnabled;
      await room.localParticipant.setCameraEnabled(next);

      const camPub = room.localParticipant.getTrackPublication(
        Track.Source.Camera
      );

      setState((s) => ({
        ...s,
        isVideoEnabled: next,
        isVideoAutoPaused: false,
        localVideoTrack: camPub?.track ?? null,
      }));

      wasVideoEnabledRef.current = false;
    } catch (err) {
      setState((s) => ({
        ...s,
        error: "Camera permission is required for video calls.",
      }));
    }
  }, []);

  const switchCamera = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      const camPub = room.localParticipant.getTrackPublication(
        Track.Source.Camera
      );
      if (camPub?.track) {
        // @ts-ignore — restartTrack with facingMode switch
        await camPub.track.restartTrack({
          facingMode:
            (camPub.track as any).mediaStreamTrack?.getSettings?.()
              ?.facingMode === "user"
              ? "environment"
              : "user",
        });
      }
    } catch {
      // Camera switching not supported on this device — silently ignore
    }
  }, []);

  // ── Disconnect ───────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (qualityTimerRef.current) {
      clearTimeout(qualityTimerRef.current);
      qualityTimerRef.current = null;
    }

    const room = roomRef.current;
    if (room) {
      // Unpublish all tracks and disconnect
      room.localParticipant.trackPublications.forEach((pub) => {
        if (pub.track) {
          pub.track.stop();
        }
      });

      await room.disconnect(true);
      roomRef.current = null;
    }

    wasVideoEnabledRef.current = false;

    setState({
      connectionState: ConnectionState.Disconnected,
      connectionQuality: ConnectionQuality.Unknown,
      isAudioEnabled: false,
      isVideoEnabled: false,
      isVideoAutoPaused: false,
      remoteParticipant: null,
      remoteVideoTrack: null,
      remoteAudioTrack: null,
      localVideoTrack: null,
      error: null,
      isConnecting: false,
    });
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (qualityTimerRef.current) clearTimeout(qualityTimerRef.current);

      const room = roomRef.current;
      if (room) {
        room.localParticipant.trackPublications.forEach((pub) => {
          if (pub.track) pub.track.stop();
        });
        room.disconnect(true);
        roomRef.current = null;
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    switchCamera,
  };
}
