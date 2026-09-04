import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@clerk/expo';

// Color Palette
const COLORS = {
  white: '#FFFFFF',
  background: '#F3F2EF', // LinkedIn-ish background color
  primaryBlue: '#0A66C2', // LinkedIn blue
  primaryBlueLight: '#E8F3FF',
  textDark: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  danger: '#D11124',
  dangerLight: '#FEE2E2',
};

export default function Profile() {
  const { signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Editable Profile States
  const [profileData, setProfileData] = useState({
    name: 'Dr. Rahul Sharma',
    headline: 'Interventional Cardiologist at City General Hospital',
    location: 'New Delhi, India',
    about: 'Dedicated and compassionate Interventional Cardiologist with over 15 years of experience in performing complex cardiac procedures. Committed to providing patient-centered care and advancing cardiovascular health through innovative treatments and clinical research.',
    email: 'rahul.sharma@mediquick.com',
    phone: '+91 98765 43210',
    qualifications: 'MBBS, MD, DM (Cardiology)',
    registrationNo: 'MCI-123456 (Delhi Medical Council)',
    workingHours: '09:00 AM - 05:00 PM (Mon - Sat)',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile changes saved successfully!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cover Photo & Profile Intro Card */}
        <View style={styles.card}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.coverPhoto}
          />
          
          <View style={styles.introContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop' }}
                style={styles.profileAvatar}
              />
              <Pressable style={styles.editIconBtn} onPress={isEditing ? handleSave : () => setIsEditing(true)}>
                <Ionicons name={isEditing ? "checkmark" : "pencil"} size={16} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            {isEditing ? (
              <TextInput
                style={styles.editNameInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
              />
            ) : (
              <Text style={styles.doctorName}>{profileData.name}</Text>
            )}

            {isEditing ? (
              <TextInput
                style={styles.editHeadlineInput}
                value={profileData.headline}
                onChangeText={(text) => setProfileData({ ...profileData, headline: text })}
                multiline
              />
            ) : (
              <Text style={styles.headline}>{profileData.headline}</Text>
            )}

            <Text style={styles.location}>{profileData.location}</Text>

          </View>
        </View>

        {/* About Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About</Text>
            {isEditing && <Ionicons name="pencil" size={20} color={COLORS.textSecondary} />}
          </View>
          {isEditing ? (
            <TextInput
              style={styles.editAboutInput}
              value={profileData.about}
              onChangeText={(text) => setProfileData({ ...profileData, about: text })}
              multiline
            />
          ) : (
            <Text style={styles.bodyText}>{profileData.about}</Text>
          )}
        </View>

        {/* Experience & Credentials */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Credentials & Details</Text>
          </View>

          <View style={styles.listSection}>
            <View style={styles.listItem}>
              <Ionicons name="school" size={24} color={COLORS.textSecondary} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Qualifications</Text>
                {isEditing ? (
                  <TextInput style={styles.listInput} value={profileData.qualifications} onChangeText={(text) => setProfileData({ ...profileData, qualifications: text })} />
                ) : (
                  <Text style={styles.listSubtitle}>{profileData.qualifications}</Text>
                )}
              </View>
            </View>

            <View style={styles.listDivider} />

            <View style={styles.listItem}>
              <Ionicons name="document-text" size={24} color={COLORS.textSecondary} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Medical Registration</Text>
                {isEditing ? (
                  <TextInput style={styles.listInput} value={profileData.registrationNo} onChangeText={(text) => setProfileData({ ...profileData, registrationNo: text })} />
                ) : (
                  <Text style={styles.listSubtitle}>{profileData.registrationNo}</Text>
                )}
              </View>
            </View>

            <View style={styles.listDivider} />

            <View style={styles.listItem}>
              <Ionicons name="time" size={24} color={COLORS.textSecondary} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Working Hours</Text>
                {isEditing ? (
                  <TextInput style={styles.listInput} value={profileData.workingHours} onChangeText={(text) => setProfileData({ ...profileData, workingHours: text })} />
                ) : (
                  <Text style={styles.listSubtitle}>{profileData.workingHours}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contact Info</Text>
          </View>
          
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={20} color={COLORS.primaryBlue} />
            {isEditing ? (
              <TextInput style={styles.contactInput} value={profileData.email} onChangeText={(text) => setProfileData({ ...profileData, email: text })} />
            ) : (
              <Text style={styles.contactText}>{profileData.email}</Text>
            )}
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call" size={20} color={COLORS.primaryBlue} />
            {isEditing ? (
              <TextInput style={styles.contactInput} value={profileData.phone} onChangeText={(text) => setProfileData({ ...profileData, phone: text })} />
            ) : (
              <Text style={styles.contactText}>{profileData.phone}</Text>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <Pressable style={styles.settingsCard} onPress={() => Alert.alert('Settings', 'Opening account settings...')}>
          <View style={styles.settingsLeft}>
            <Ionicons name="settings-sharp" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingsText}>Account Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        {/* Logout Action */}
        <Pressable style={styles.logoutCard} onPress={handleLogout}>
          <Ionicons name="log-out" size={22} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  coverPhoto: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.primaryBlueLight,
  },
  introContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: -40,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  editIconBtn: {
    marginTop: 50,
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  editNameInput: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryBlue,
    paddingVertical: 2,
  },
  headline: {
    fontSize: 15,
    color: COLORS.textDark,
    marginTop: 4,
  },
  editHeadlineInput: {
    fontSize: 15,
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryBlue,
    marginTop: 4,
    paddingVertical: 2,
  },
  location: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  connectionRow: {
    marginTop: 12,
  },
  connectionsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  primaryActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryBlue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primaryBlue,
    fontWeight: '700',
    fontSize: 15,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editAboutInput: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryBlue,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  listSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  listSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listInput: {
    fontSize: 14,
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryBlue,
    marginTop: 2,
    paddingVertical: 2,
  },
  listDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 36,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  contactInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryBlue,
    paddingVertical: 2,
  },

  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
});
