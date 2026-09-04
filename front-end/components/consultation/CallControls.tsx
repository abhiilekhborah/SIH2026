import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CallControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

function CallControlsComponent({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onSwitchCamera,
  onEndCall,
}: CallControlsProps) {
  return (
    <View style={styles.container}>
      {/* Mute / Unmute */}
      <TouchableOpacity
        style={[styles.button, !isAudioEnabled && styles.buttonOff]}
        onPress={onToggleAudio}
        activeOpacity={0.7}
        accessibilityLabel={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        <Ionicons
          name={isAudioEnabled ? "mic" : "mic-off"}
          size={26}
          color="#FFFFFF"
        />
        <Text style={styles.label}>{isAudioEnabled ? "Mute" : "Unmute"}</Text>
      </TouchableOpacity>

      {/* Video On / Off */}
      <TouchableOpacity
        style={[styles.button, !isVideoEnabled && styles.buttonOff]}
        onPress={onToggleVideo}
        activeOpacity={0.7}
        accessibilityLabel={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        <Ionicons
          name={isVideoEnabled ? "videocam" : "videocam-off"}
          size={26}
          color="#FFFFFF"
        />
        <Text style={styles.label}>{isVideoEnabled ? "Video" : "Video"}</Text>
      </TouchableOpacity>

      {/* Switch Camera */}
      <TouchableOpacity
        style={styles.button}
        onPress={onSwitchCamera}
        activeOpacity={0.7}
        accessibilityLabel="Switch camera"
      >
        <Ionicons name="camera-reverse" size={26} color="#FFFFFF" />
        <Text style={styles.label}>Switch</Text>
      </TouchableOpacity>

      {/* End Call */}
      <TouchableOpacity
        style={[styles.button, styles.endButton]}
        onPress={onEndCall}
        activeOpacity={0.7}
        accessibilityLabel="End call"
      >
        <Ionicons name="call" size={26} color="#FFFFFF" style={styles.endIcon} />
        <Text style={styles.label}>End</Text>
      </TouchableOpacity>
    </View>
  );
}

export const CallControls = memo(CallControlsComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 28,
    marginHorizontal: 16,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOff: {
    backgroundColor: "rgba(239, 68, 68, 0.4)",
  },
  endButton: {
    backgroundColor: "#EF4444",
  },
  endIcon: {
    transform: [{ rotate: "135deg" }],
  },
  label: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
});
