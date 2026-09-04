import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoView as LKVideoView } from "@livekit/react-native";

interface ConsultationVideoViewProps {
  /** Remote participant's video track (rendered full-screen) */
  remoteVideoTrack?: any;
  /** Local camera video track (rendered as PiP) */
  localVideoTrack?: any;
  /** Name of the remote participant */
  remoteName?: string;
  /** Whether remote video is available */
  isRemoteVideoOn: boolean;
  /** Whether local video is available */
  isLocalVideoOn: boolean;
}

function ConsultationVideoViewComponent({
  remoteVideoTrack,
  localVideoTrack,
  remoteName = "Participant",
  isRemoteVideoOn,
  isLocalVideoOn,
}: ConsultationVideoViewProps) {
  return (
    <View style={styles.container}>
      {/* ── Remote Video (Full Screen) ──────────────────────────────────── */}
      {isRemoteVideoOn && remoteVideoTrack?.track ? (
        <LKVideoView
          videoTrack={remoteVideoTrack.track}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.remoteVideoPlaceholder}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.participantName}>{remoteName}</Text>
          <Text style={styles.placeholderText}>
            {remoteVideoTrack
              ? "Camera is off"
              : "Waiting for participant..."}
          </Text>
        </View>
      )}

      {/* ── Local Video (PiP) ──────────────────────────────────────────── */}
      {isLocalVideoOn && localVideoTrack ? (
        <View style={styles.localVideoContainer}>
          <LKVideoView
            videoTrack={localVideoTrack}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
        </View>
      ) : (
        <View style={[styles.localVideoContainer, styles.localVideoOff]}>
          <Ionicons name="person" size={24} color="#94A3B8" />
          <Text style={styles.localVideoOffText}>Camera off</Text>
        </View>
      )}
    </View>
  );
}

export const ConsultationVideoView = memo(ConsultationVideoViewComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    position: "relative",
  },

  // Remote video fills the entire view
  remoteVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  remoteVideoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E293B",
  },

  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  participantName: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  placeholderText: {
    color: "#64748B",
    fontSize: 14,
  },

  // Local video PiP — bottom-right corner
  localVideoContainer: {
    position: "absolute",
    bottom: 120,
    right: 16,
    width: 110,
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  localVideo: {
    width: "100%",
    height: "100%",
  },

  localVideoOff: {
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },

  localVideoOffText: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 4,
  },
});
