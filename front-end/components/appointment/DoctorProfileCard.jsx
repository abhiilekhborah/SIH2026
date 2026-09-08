import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';

/**
 * DoctorProfileCard
 * Rural-optimized Doctor Profile Card with dynamic real-time status sync.
 * Preserves existing MediQuick card layout and styling.
 */
export default function DoctorProfileCard({
  doctorName = 'Dr. Alexander Smith',
  specialty = 'Senior Physician • 15 Yrs Exp',
  rating = '4.9',
  reviewCount = '120',
  requestStatus = null, // 'pending' | 'accepted' | 'rejected' | 'rescheduled' | null
  proposedTime = null,
  onRequestDigitalPress,
  onRequestInVisitPress,
  isLoading = false,
}) {
  // Format status badge appearance
  const getStatusBadgeConfig = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return {
          label: 'Request Pending',
          bg: MQ.amberLight,
          color: MQ.amber,
          icon: 'time-outline',
        };
      case 'accepted':
        return {
          label: 'Accepted',
          bg: MQ.greenLight,
          color: MQ.green,
          icon: 'checkmark-circle-outline',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bg: MQ.redLight,
          color: MQ.red,
          icon: 'close-circle-outline',
        };
      case 'rescheduled':
        const timeFormatted = proposedTime
          ? new Date(proposedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';
        return {
          label: proposedTime ? `Rescheduled at ${timeFormatted}` : 'Rescheduled',
          bg: MQ.blueLight,
          color: MQ.blue,
          icon: 'calendar-outline',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusBadgeConfig(requestStatus);

  return (
    <View style={styles.assignedDoctorCard}>
      {/* Dynamic Real-Time Status Banner */}
      {statusConfig && (
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} style={{ marginRight: 6 }} />
          <Text style={[styles.statusBannerText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={statusConfig.color} style={{ marginLeft: 8 }} />}
        </View>
      )}

      <View style={styles.assignedDoctorInfo}>
        <View style={styles.doctorPhotoWrap}>
          <Ionicons name="person" size={32} color={MQ.teal} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.assignedDoctorName}>{doctorName}</Text>
          <Text style={styles.assignedDoctorSpecialty}>{specialty}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={MQ.amber} />
            <Text style={styles.ratingText}>{rating} ({reviewCount} Reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.assignedDoctorButtons}>
        <TouchableOpacity
          style={styles.digitalBtn}
          onPress={onRequestDigitalPress}
          activeOpacity={0.8}
        >
          <Ionicons name="videocam-outline" size={18} color={MQ.teal} style={{ marginRight: 6 }} />
          <Text style={styles.digitalBtnText}>Request Digital Appointment</Text>
        </TouchableOpacity>

        {onRequestInVisitPress && (
          <TouchableOpacity
            style={styles.inVisitBtn}
            onPress={onRequestInVisitPress}
            activeOpacity={0.8}
          >
            <Ionicons name="business-outline" size={18} color={MQ.bgWhite} style={{ marginRight: 6 }} />
            <Text style={styles.inVisitBtnText}>In-visit Appt</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  assignedDoctorCard: {
    backgroundColor: MQ.glassBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  assignedDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorPhotoWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MQ.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  assignedDoctorName: {
    fontSize: 18,
    fontWeight: '800',
    color: MQ.textPrimary,
    marginBottom: 4,
  },
  assignedDoctorSpecialty: {
    fontSize: 13,
    color: MQ.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: MQ.textSecondary,
    marginLeft: 4,
  },
  assignedDoctorButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  digitalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MQ.tealLight,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
  },
  digitalBtnText: {
    color: MQ.teal,
    fontWeight: '700',
    fontSize: 13,
  },
  inVisitBtn: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MQ.teal,
    paddingVertical: 12,
    borderRadius: 12,
  },
  inVisitBtnText: {
    color: MQ.bgWhite,
    fontWeight: '700',
    fontSize: 13,
  },
});
