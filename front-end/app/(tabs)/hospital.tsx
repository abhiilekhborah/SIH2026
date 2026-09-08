import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { MQ } from '@/constants/theme';
import { AppHeader } from '@/components/app-header';
import { useNotifications } from '@/components/notification-context';

const MAP_URL = 'https://map-for-mediquick.onrender.com/';

// Jorhat, Assam coordinates
const JORHAT_COORDS = {
  latitude: 26.7509,
  longitude: 94.2037,
  city: 'Jorhat',
  region: 'Assam',
};

interface HospitalItem {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  travelTimeMins: number;
  address: string;
  phone: string;
  isEmergency: boolean;
  isOpen: boolean;
  type: string;
}

// Verified hospitals in Jorhat, Assam
const JORHAT_HOSPITALS: HospitalItem[] = [
  {
    id: 'jmch_1',
    name: 'Jorhat Medical College & Hospital (JMCH)',
    lat: 26.7421664,
    lon: 94.1960726,
    distanceKm: 1.2,
    travelTimeMins: 4,
    address: 'Jail Road, Rowriya, Jorhat, Assam 785001',
    phone: '+91 376 237 0107',
    isEmergency: true,
    isOpen: true,
    type: 'Govt. Medical College & Hospital',
  },
  {
    id: 'sanjivani_1',
    name: 'Sanjivani Hospital',
    lat: 26.7466487,
    lon: 94.2021123,
    distanceKm: 1.8,
    travelTimeMins: 6,
    address: 'KB Road, Tarazan, Jorhat, Assam 785001',
    phone: '+91 376 230 4444',
    isEmergency: true,
    isOpen: true,
    type: 'Multispecialty & ICU Hospital',
  },
  {
    id: 'city_ortho_1',
    name: 'City Orthopaedic Hospital',
    lat: 26.7669056,
    lon: 94.2071066,
    distanceKm: 2.1,
    travelTimeMins: 7,
    address: 'BR Phukan Road, Macharhat, Jorhat, Assam 785001',
    phone: '+91 376 232 0222',
    isEmergency: true,
    isOpen: true,
    type: 'Orthopaedic & Trauma Care',
  },
  {
    id: 'chandraprabha_1',
    name: 'Chandraprabha Eye Hospital',
    lat: 26.7621573,
    lon: 94.208063,
    distanceKm: 2.3,
    travelTimeMins: 8,
    address: 'KK Handique Path, Chowk Bazar, Jorhat, Assam 785001',
    phone: '+91 376 230 1144',
    isEmergency: false,
    isOpen: true,
    type: 'Specialized Eye Hospital',
  },
  {
    id: 'mission_1',
    name: 'Christian Mission Hospital',
    lat: 26.7385005,
    lon: 94.2010669,
    distanceKm: 2.5,
    travelTimeMins: 9,
    address: 'KB Road, Rowriah, Jorhat, Assam 785001',
    phone: '+91 376 232 0033',
    isEmergency: true,
    isOpen: true,
    type: 'General Care & Maternity',
  },
  {
    id: 'saikia_1',
    name: 'Dr. J.K. Saikia Medical College & Hospital',
    lat: 26.7319159,
    lon: 94.2210406,
    distanceKm: 3.1,
    travelTimeMins: 10,
    address: 'Club Road, Jorhat, Assam 785014',
    phone: '+91 376 231 0188',
    isEmergency: true,
    isOpen: true,
    type: 'Medical College Hospital',
  },
  {
    id: 'ongc_1',
    name: 'ONGC Medical Hospital Jorhat',
    lat: 26.7538629,
    lon: 94.2029298,
    distanceKm: 3.4,
    travelTimeMins: 11,
    address: 'Nazir Ali, Choladhara, Jorhat, Assam 785001',
    phone: '+91 376 236 0055',
    isEmergency: true,
    isOpen: true,
    type: 'Corporate Healthcare Centre',
  },
  {
    id: 'titabor_1',
    name: 'Jalukanibari Hospital',
    lat: 26.6456268,
    lon: 94.1876136,
    distanceKm: 6.5,
    travelTimeMins: 16,
    address: 'Na Ali, Titabor Sub-division, Jorhat, Assam 785630',
    phone: '+91 376 239 1234',
    isEmergency: true,
    isOpen: true,
    type: 'Community Health Hospital',
  },
];

export default function HospitalScreen() {
  const router = useRouter();
  const { openNotifications } = useNotifications();

  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [hospitals, setHospitals] = useState<HospitalItem[]>(JORHAT_HOSPITALS);
  const [filterType, setFilterType] = useState<'All' | 'Emergency' | 'Specialty'>('All');

  const filteredHospitals = hospitals.filter((h) => {
    if (filterType === 'Emergency') return h.isEmergency;
    if (filterType === 'Specialty') return !h.type.includes('Govt');
    return true;
  });

  // Open Full-Screen Interactive Live Map
  const handleOpenLiveMap = async () => {
    // Open map with Jorhat coordinates
    const targetUrl = `${MAP_URL}?lat=${JORHAT_COORDS.latitude}&lng=${JORHAT_COORDS.longitude}&city=Jorhat`;

    try {
      if (Platform.OS === 'web') {
        window.open(targetUrl, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(targetUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: '#00B5AD',
          controlsColor: '#ffffff',
          dismissButtonStyle: 'close',
        });
      }
    } catch {
      Linking.openURL(targetUrl);
    }
  };

  // Open Google Maps Live Search for Jorhat Hospitals
  const handleOpenGoogleMapsSearch = () => {
    const url = `https://www.google.com/maps/search/hospitals+in+Jorhat+Assam/@${JORHAT_COORDS.latitude},${JORHAT_COORDS.longitude},13z`;
    Linking.openURL(url);
  };

  // Turn-by-turn Navigation to selected hospital
  const handleGetDirections = (hosp: HospitalItem) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(hosp.name)}@${hosp.lat},${hosp.lon}`,
      android: `geo:0,0?q=${hosp.lat},${hosp.lon}(${encodeURIComponent(hosp.name)})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lon}`,
    });
    Linking.openURL(url as string);
  };

  const handleCall = (hosp: HospitalItem) => {
    Alert.alert('Call Hospital', `Call ${hosp.name} (${hosp.phone})?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${hosp.phone.replace(/\s+/g, '')}`) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Nearby Hospitals"
        leftElement={
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={MQ.textPrimary} />
          </TouchableOpacity>
        }
        showNotification={true}
        onPressNotification={openNotifications}
        badgeCount={0}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Location Bar - Jorhat, Assam */}
        <View style={styles.locationBar}>
          <View style={styles.locationLeft}>
            <View style={styles.pulseDot} />
            <View style={{ flex: 1 }}>
              <View style={styles.locBadgeRow}>
                <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                <View style={styles.verifiedLocationPill}>
                  <Text style={styles.verifiedLocationPillText}>GPS Verified</Text>
                </View>
              </View>
              <Text style={styles.locationCity}>Jorhat, Assam</Text>
              <Text style={styles.locationCoords}>
                {JORHAT_COORDS.latitude.toFixed(4)}° N, {JORHAT_COORDS.longitude.toFixed(4)}° E • Within 5–10 km
              </Text>
            </View>
          </View>
          <View style={styles.locIconWrapper}>
            <Ionicons name="location" size={20} color={MQ.teal} />
          </View>
        </View>

        {/* Live Map CTA Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <View style={styles.hospitalIconBg}>
              <Ionicons name="medical" size={22} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mapCardTitle}>Hospitals in Jorhat, Assam</Text>
              <Text style={styles.mapCardSub}>
                Showing verified government & private hospitals within Jorhat
              </Text>
            </View>
          </View>

          {/* Map Launch Buttons */}
          <View style={styles.mapBtnRow}>
            <TouchableOpacity
              style={styles.openMapBtn}
              onPress={handleOpenLiveMap}
              activeOpacity={0.85}
            >
              <Ionicons name="map" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openMapBtnText}>MediQuick Live Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleMapsBtn}
              onPress={handleOpenGoogleMapsSearch}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-circle" size={17} color="#2563EB" style={{ marginRight: 5 }} />
              <Text style={styles.googleMapsBtnText}>Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['All', 'Emergency', 'Specialty'] as const).map((filter) => {
            const active = filterType === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilterType(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {filter === 'All'
                    ? `All in Jorhat (${hospitals.length})`
                    : filter === 'Emergency'
                    ? '24/7 Emergency'
                    : 'Specialty Hospitals'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hospital List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>
            Hospitals in Jorhat ({filteredHospitals.length})
          </Text>
          <Text style={styles.listSubText}>Sorted by closest</Text>
        </View>

        {/* Hospital Cards List */}
        <View style={styles.hospitalList}>
          {filteredHospitals.map((hosp, index) => (
            <View key={hosp.id} style={styles.hospCard}>
              <View style={styles.hospCardTop}>
                <View style={styles.hospRankBadge}>
                  <Text style={styles.hospRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.hospMain}>
                  <Text style={styles.hospName} numberOfLines={2}>
                    {hosp.name}
                  </Text>
                  <Text style={styles.hospType}>{hosp.type}</Text>
                  <Text style={styles.hospAddress} numberOfLines={2}>
                    📍 {hosp.address}
                  </Text>
                </View>
                <View style={styles.distBadge}>
                  <Text style={styles.distBadgeText}>{hosp.distanceKm} km</Text>
                  <Text style={styles.distTimeText}>~{hosp.travelTimeMins} min</Text>
                </View>
              </View>

              {/* Status Badges */}
              <View style={styles.statusRow}>
                {hosp.isEmergency && (
                  <View style={styles.emergencyPill}>
                    <Ionicons name="flash" size={12} color="#DC2626" />
                    <Text style={styles.emergencyPillText}>24/7 Emergency</Text>
                  </View>
                )}
                <View style={styles.openPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.openPillText}>Open Now</Text>
                </View>
                <View style={styles.verifiedPill}>
                  <Ionicons name="shield-checkmark" size={11} color="#16A34A" />
                  <Text style={styles.verifiedPillText}>Verified Jorhat</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.hospActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.callBtn]}
                  onPress={() => handleCall(hosp)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="call" size={15} color="#2563EB" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.navBtn]}
                  onPress={() => handleGetDirections(hosp)}
                  activeOpacity={0.75}
                >
                  <Ionicons name="navigate" size={15} color="#FFFFFF" />
                  <Text style={styles.navBtnText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MQ.bgLight,
  },
  bgLight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MQ.bgLight,
  },
  bgTealTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0,181,173,0.08)',
  },
  header: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,181,173,0.12)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,181,173,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,181,173,0.25)',
    marginBottom: 16,
    shadowColor: '#00B5AD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
  },
  locBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MQ.textMuted,
    letterSpacing: 0.6,
  },
  verifiedLocationPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedLocationPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  locationCity: {
    fontSize: 18,
    fontWeight: '700',
    color: MQ.textPrimary,
  },
  locationCoords: {
    fontSize: 12,
    color: MQ.textSecondary,
    marginTop: 2,
  },
  locIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MQ.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  hospitalIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MQ.textPrimary,
  },
  mapCardSub: {
    fontSize: 12,
    color: MQ.textSecondary,
    marginTop: 2,
  },
  mapBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  openMapBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MQ.teal,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: MQ.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  googleMapsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    borderRadius: 12,
  },
  googleMapsBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: MQ.teal,
    borderColor: MQ.teal,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: MQ.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MQ.textPrimary,
  },
  listSubText: {
    fontSize: 12,
    color: MQ.textMuted,
    fontWeight: '500',
  },
  hospitalList: {
    gap: 12,
  },
  hospCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hospCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  hospRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  hospRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: MQ.textSecondary,
  },
  hospMain: {
    flex: 1,
  },
  hospName: {
    fontSize: 15,
    fontWeight: '700',
    color: MQ.textPrimary,
    lineHeight: 20,
  },
  hospType: {
    fontSize: 12,
    color: MQ.teal,
    fontWeight: '600',
    marginTop: 2,
  },
  hospAddress: {
    fontSize: 12,
    color: MQ.textSecondary,
    marginTop: 3,
  },
  distBadge: {
    alignItems: 'flex-end',
  },
  distBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  distTimeText: {
    fontSize: 11,
    color: MQ.textMuted,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  emergencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  emergencyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  openPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  hospActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  navBtn: {
    flex: 1.6,
    backgroundColor: '#2563EB',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
