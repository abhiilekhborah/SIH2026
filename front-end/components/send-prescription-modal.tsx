import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MQ } from '@/constants/theme';
import {
  fetchPatientPrescriptions,
  fetchPharmacies,
  sendPrescriptionToPharmacy,
  type Pharmacy,
  type Prescription,
} from '@/lib/prescriptions';

/**
 * Two-step flow the patient uses to hand a prescription to a pharmacy:
 * pick the prescription, then pick where it goes. Sending is what puts it in
 * that pharmacy's queue.
 */
export function SendPrescriptionModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'prescription' | 'pharmacy'>('prescription');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rx, stores] = await Promise.all([
        fetchPatientPrescriptions(),
        fetchPharmacies(),
      ]);
      // A fulfilled or cancelled prescription has nowhere left to go.
      setPrescriptions(
        rx.filter((item) => item.status === 'created' || item.status === 'sent_to_pharmacy')
      );
      setPharmacies(stores.filter((store) => store.acceptsTeleorders));
    } catch (err: any) {
      setError(err?.message ?? 'Could not load your prescriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    setStep('prescription');
    setSelected(null);
    load();
  }, [visible, load]);

  const send = async (pharmacy: Pharmacy) => {
    if (!selected) return;

    setSendingTo(pharmacy.id);
    try {
      await sendPrescriptionToPharmacy(selected.id, pharmacy.id);
      Alert.alert(
        'Prescription sent',
        `${pharmacy.name ?? 'The pharmacy'} has your prescription and will confirm shortly.`
      );
      onClose();
    } catch (err: any) {
      Alert.alert('Could not send', err?.message ?? 'Please try again.');
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            {step === 'pharmacy' ? (
              <TouchableOpacity onPress={() => setStep('prescription')} hitSlop={8}>
                <Ionicons name="arrow-back" size={22} color={MQ.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 22 }} />
            )}
            <Text style={styles.title}>
              {step === 'prescription' ? 'Choose a prescription' : 'Choose a pharmacy'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={MQ.textPrimary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={MQ.teal} />
            </View>
          ) : error ? (
            <View style={styles.centered}>
              <Ionicons name="cloud-offline-outline" size={34} color={MQ.textMuted} />
              <Text style={styles.emptyText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={load}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : step === 'prescription' ? (
            <PrescriptionList
              prescriptions={prescriptions}
              onPick={(item) => {
                setSelected(item);
                setStep('pharmacy');
              }}
            />
          ) : (
            <PharmacyList pharmacies={pharmacies} sendingTo={sendingTo} onPick={send} />
          )}
        </View>
      </View>
    </Modal>
  );
}

function PrescriptionList({
  prescriptions,
  onPick,
}: {
  prescriptions: Prescription[];
  onPick: (item: Prescription) => void;
}) {
  if (prescriptions.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="document-text-outline" size={34} color={MQ.textMuted} />
        <Text style={styles.emptyText}>
          No prescriptions to send yet. They appear here once a doctor issues one.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {prescriptions.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => onPick(item)}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="document-text" size={20} color={MQ.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {item.doctorName ? `Dr. ${item.doctorName}` : 'Your doctor'}
            </Text>
            <Text style={styles.cardMeta}>
              {item.items.length} medicine{item.items.length === 1 ? '' : 's'} ·{' '}
              {new Date(item.issuedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
            {item.status === 'sent_to_pharmacy' && (
              <Text style={styles.cardNote}>Already sent to a pharmacy</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={MQ.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function PharmacyList({
  pharmacies,
  sendingTo,
  onPick,
}: {
  pharmacies: Pharmacy[];
  sendingTo: string | null;
  onPick: (pharmacy: Pharmacy) => void;
}) {
  if (pharmacies.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="storefront-outline" size={34} color={MQ.textMuted} />
        <Text style={styles.emptyText}>No pharmacies are accepting online orders right now.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {pharmacies.map((pharmacy) => {
        const busy = sendingTo === pharmacy.id;
        const place = [pharmacy.villageTown, pharmacy.district].filter(Boolean).join(', ');

        return (
          <TouchableOpacity
            key={pharmacy.id}
            style={[styles.card, busy && styles.cardBusy]}
            activeOpacity={0.8}
            disabled={sendingTo !== null}
            onPress={() => onPick(pharmacy)}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="storefront" size={20} color={MQ.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{pharmacy.name ?? 'Pharmacy'}</Text>
              {!!place && <Text style={styles.cardMeta}>{place}</Text>}
              {!!pharmacy.phone && <Text style={styles.cardMeta}>{pharmacy.phone}</Text>}
            </View>
            {busy ? (
              <ActivityIndicator size="small" color={MQ.teal} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={MQ.textMuted} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(13,51,73,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: MQ.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: MQ.tealBorder,
  },
  title: { fontSize: 16, fontWeight: '700', color: MQ.textPrimary },
  centered: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: {
    fontSize: 13,
    color: MQ.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: MQ.tealLight,
  },
  retryText: { color: MQ.teal, fontWeight: '700', fontSize: 13 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    backgroundColor: MQ.bgLight,
  },
  cardBusy: { opacity: 0.6 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MQ.tealLight,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: MQ.textPrimary },
  cardMeta: { fontSize: 12, color: MQ.textSecondary, marginTop: 2 },
  cardNote: { fontSize: 11, color: MQ.amber, marginTop: 3, fontWeight: '600' },
});
