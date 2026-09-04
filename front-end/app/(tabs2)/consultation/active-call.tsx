import React, { useEffect, useCallback } from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useConsultation } from "@/hooks/useConsultation";
import { endConsultationAPI } from "@/lib/consultation";
import { CallControls } from "@/components/consultation/CallControls";
import { ConsultationVideoView } from "@/components/consultation/VideoView";
import { ConnectionStatus } from "@/components/consultation/ConnectionStatus";
const { ConnectionState } = require("livekit-client");

export default function DoctorActiveCall() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token: string;
    url: string;
    roomName: string;
    consultationId: string;
    role: string;
    userName: string;
  }>();

  const {
    connectionState,
    connectionQuality,
    isAudioEnabled,
    isVideoEnabled,
    isVideoAutoPaused,
    remoteParticipant,
    remoteVideoTrack,
    localVideoTrack,
    error,
    isConnecting,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    switchCamera,
  } = useConsultation({
    url: params.url || "",
    token: params.token || "",
  });

  // ── Auto-connect on mount ──────────────────────────────────────────────

  useEffect(() => {
    if (params.url && params.token) {
      connect();
    }
  }, [params.url, params.token]);

  // ── End call handler ───────────────────────────────────────────────────

  const handleEndCall = useCallback(async () => {
    await disconnect();
    if (params.consultationId) {
      endConsultationAPI(params.consultationId);
    }
    router.back();
  }, [disconnect, params.consultationId, router]);

  // ── Render ─────────────────────────────────────────────────────────────

  const remoteName = remoteParticipant?.name || "Patient";
  const isRemoteVideoOn = !!remoteVideoTrack?.track;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Consultation</Text>

        <View style={styles.topBarRight}>
          {connectionState === ConnectionState.Connected && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <ConnectionStatus
            connectionState={connectionState}
            connectionQuality={connectionQuality}
            isVideoAutoPaused={isVideoAutoPaused}
          />
        </View>
      </View>

      {/* ── Video Area ──────────────────────────────────────────────────── */}
      <ConsultationVideoView
        remoteVideoTrack={remoteVideoTrack}
        localVideoTrack={localVideoTrack}
        remoteName={remoteName}
        isRemoteVideoOn={isRemoteVideoOn}
        isLocalVideoOn={isVideoEnabled}
      />

      {/* ── Connection Status Banner ────────────────────────────────────── */}
      {isVideoAutoPaused && (
        <View style={styles.bannerContainer}>
          <ConnectionStatus
            connectionState={connectionState}
            connectionQuality={connectionQuality}
            isVideoAutoPaused={isVideoAutoPaused}
          />
        </View>
      )}

      {/* ── Status Messages ─────────────────────────────────────────────── */}
      {isConnecting && (
        <View style={styles.statusOverlay}>
          <Text style={styles.statusText}>Connecting to consultation...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {connectionState === ConnectionState.Connected &&
        !remoteParticipant && (
          <View style={styles.waitingOverlay}>
            <Text style={styles.waitingText}>
              Waiting for patient to join...
            </Text>
          </View>
        )}

      {/* ── Call Controls ───────────────────────────────────────────────── */}
      <View style={styles.controlsContainer}>
        <CallControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSwitchCamera={switchCamera}
          onEndCall={handleEndCall}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  topBarTitle: {
    color: "#E2E8F0",
    fontSize: 17,
    fontWeight: "700",
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  liveText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Status overlays
  bannerContainer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  statusOverlay: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  statusText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  errorOverlay: {
    position: "absolute",
    bottom: 150,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 10,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "500",
    backgroundColor: "rgba(127, 29, 29, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    textAlign: "center",
  },
  waitingOverlay: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  waitingText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },

  // Controls
  controlsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
