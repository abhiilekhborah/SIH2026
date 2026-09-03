import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { requestConsultationToken } from "@/lib/consultation";

const BLUE = "#1A66E8";

export default function DoctorConsultationIndex() {
  const router = useRouter();
  const { user } = useUser();
  const [consultationId, setConsultationId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const trimmedId = consultationId.trim();
    if (!trimmedId) {
      Alert.alert(
        "Enter Consultation ID",
        "Please enter the consultation or appointment ID."
      );
      return;
    }

    setLoading(true);
    try {
      const userName = `Dr. ${user?.firstName || user?.fullName || "Doctor"}`;
      const data = await requestConsultationToken(trimmedId, "doctor", userName);

      router.push({
        pathname: "/(tabs2)/consultation/active-call" as any,
        params: {
          token: data.token,
          url: data.livekit_url,
          roomName: data.room_name,
          consultationId: trimmedId,
          role: "doctor",
          userName,
        },
      });
    } catch (err: any) {
      Alert.alert(
        "Connection Failed",
        err?.message ||
          "Unable to start consultation. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teleconsultation</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="medkit" size={40} color={BLUE} />
        </View>

        <Text style={styles.title}>Start Consultation</Text>
        <Text style={styles.subtitle}>
          Enter the consultation ID to connect with your patient for a voice or
          video call.
        </Text>

        {/* ID Input */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="key-outline"
            size={20}
            color="#94A3B8"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Consultation ID"
            placeholderTextColor="#94A3B8"
            value={consultationId}
            onChangeText={setConsultationId}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleJoin}
          />
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, loading && styles.joinButtonDisabled]}
          onPress={handleJoin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Start Consultation</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mic-outline" size={18} color="#64748B" />
            <Text style={styles.infoText}>
              Voice call starts automatically
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="videocam-outline" size={18} color="#64748B" />
            <Text style={styles.infoText}>
              Video can be enabled during call
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#64748B" />
            <Text style={styles.infoText}>
              Secure, encrypted communication
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    height: "100%",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 56,
    backgroundColor: BLUE,
    borderRadius: 16,
    gap: 10,
    marginBottom: 32,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
});
