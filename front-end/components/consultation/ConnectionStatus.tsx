import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConnectionQuality, ConnectionState } from "livekit-client";

interface ConnectionStatusProps {
  connectionState: ConnectionState;
  connectionQuality: ConnectionQuality;
  isVideoAutoPaused: boolean;
}

function ConnectionStatusComponent({
  connectionState,
  connectionQuality,
  isVideoAutoPaused,
}: ConnectionStatusProps) {
  // ── Connection state messages ────────────────────────────────────────────

  if (connectionState === ConnectionState.Reconnecting) {
    return (
      <View style={[styles.banner, styles.warningBanner]}>
        <Ionicons name="reload" size={16} color="#F59E0B" />
        <Text style={[styles.bannerText, styles.warningText]}>
          Connection lost. Attempting to reconnect...
        </Text>
      </View>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return null; // Don't show anything when disconnected
  }

  // ── Auto-paused video warning ────────────────────────────────────────────

  if (isVideoAutoPaused) {
    return (
      <View style={[styles.banner, styles.warningBanner]}>
        <Ionicons name="warning" size={16} color="#F59E0B" />
        <Text style={[styles.bannerText, styles.warningText]}>
          Poor connection. Video paused to maintain audio quality.
        </Text>
      </View>
    );
  }

  // ── Quality indicator dot ────────────────────────────────────────────────

  const qualityConfig = getQualityConfig(connectionQuality);

  return (
    <View style={styles.indicator}>
      <View style={[styles.dot, { backgroundColor: qualityConfig.color }]} />
      <Text style={[styles.indicatorText, { color: qualityConfig.color }]}>
        {qualityConfig.label}
      </Text>
    </View>
  );
}

function getQualityConfig(quality: ConnectionQuality) {
  switch (quality) {
    case ConnectionQuality.Excellent:
      return { color: "#10B981", label: "Excellent" };
    case ConnectionQuality.Good:
      return { color: "#10B981", label: "Good" };
    case ConnectionQuality.Poor:
      return { color: "#F59E0B", label: "Poor connection" };
    case ConnectionQuality.Lost:
      return { color: "#EF4444", label: "Connection lost" };
    default:
      return { color: "#64748B", label: "Connecting..." };
  }
}

export const ConnectionStatus = memo(ConnectionStatusComponent);

const styles = StyleSheet.create({
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  warningBanner: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  warningText: {
    color: "#F59E0B",
  },
});
