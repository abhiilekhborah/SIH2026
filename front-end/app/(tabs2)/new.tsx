import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createPrescription } from '@/lib/prescriptions';

const COLORS = { ink: '#10233F', muted: '#728197', blue: '#246BFD', blueSoft: '#EEF4FF', mint: '#E9FAF4', mintText: '#12956A', canvas: '#F6F8FC', card: '#FFFFFF', line: '#E4EAF2', red: '#E5484D' };
type Medicine = { id: number; name: string; dose: string; timing: string; duration: string };
const emptyMedicine = (id: number): Medicine => ({ id, name: '', dose: '', timing: 'After food', duration: '5 days' });

export default function DoctorWorkspace() {
  const params = useLocalSearchParams<{ patientName?: string; patientAge?: string; patientId?: string }>();
  const router = useRouter();
  const closeModal = () => router.canGoBack() ? router.back() : router.replace('/(tabs2)/home' as any);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal} />
        <SafeAreaView style={styles.prescriptionModal} edges={['left', 'right']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Prescription</Text>
            <Pressable onPress={closeModal} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.ink} />
            </Pressable>
          </View>
          <NewPrescription onClose={closeModal} patientName={params.patientName} patientAge={params.patientAge} patientId={params.patientId} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function NewPrescription({ onClose, patientName, patientAge, patientId }: { onClose: () => void; patientName?: string; patientAge?: string; patientId?: string }) {
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine(1)]);
  const [nextMedicineId, setNextMedicineId] = useState(2);
  const [name, setName] = useState(patientName ?? '');
  const [age, setAge] = useState(patientAge ?? '');
  const [clinicalNote, setClinicalNote] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { setName(patientName ?? ''); setAge(patientAge ?? ''); }, [patientName, patientAge]);
  const updateMedicine = (id: number, field: keyof Omit<Medicine, 'id'>, value: string) => setMedicines(current => current.map(medicine => medicine.id === id ? { ...medicine, [field]: value } : medicine));
  const addMedicine = () => { setMedicines(current => [...current, emptyMedicine(nextMedicineId)]); setNextMedicineId(current => current + 1); };
  const removeMedicine = (id: number) => {
    if (medicines.length === 1) { setMedicines([emptyMedicine(nextMedicineId)]); setNextMedicineId(current => current + 1); return; }
    setMedicines(current => current.filter(medicine => medicine.id !== id));
  };
  const issuePrescription = async () => {
    // Without a real patient_profiles.id there is nobody to write this against.
    // Reaching this screen from Appointments carries the id; the mock patient
    // list in History does not.
    if (!patientId) {
      Alert.alert(
        'Pick the patient first',
        'Open this patient from your Appointments list to prescribe — that is what links the prescription to their record.'
      );
      return;
    }

    const filled = medicines.filter(medicine => medicine.name.trim());
    if (filled.length === 0) {
      Alert.alert('Add a medicine', 'A prescription needs at least one medicine.');
      return;
    }

    setSaving(true);
    try {
      await createPrescription({
        patientId,
        clinicalNote: clinicalNote.trim() || undefined,
        items: filled.map(medicine => ({
          name: medicine.name.trim(),
          dosage: medicine.dose.trim() || undefined,
          frequency: medicine.timing.trim() || undefined,
          duration: medicine.duration.trim() || undefined,
        })),
      });

      Alert.alert('Prescription issued', `Sent to ${name || 'the patient'}. They can now forward it to a pharmacy.`);
      onClose();
    } catch (error: any) {
      Alert.alert('Could not issue prescription', error?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <SectionHeader icon="person-outline" title="Patient details" caption="Who is this prescription for?" />
      <View style={styles.card}>
        <LabeledInput label="PATIENT NAME" value={name} onChangeText={setName} placeholder="Search or enter patient name" icon="search-outline" />
        <View style={styles.formDivider} />
        <View style={styles.twoColumns}>
          <LabeledInput label="AGE" value={age} onChangeText={setAge} placeholder="e.g. 34" keyboardType="number-pad" />
          <View style={styles.columnDivider} />
          <LabeledInput label="WEIGHT" placeholder="e.g. 68 kg" keyboardType="number-pad" />
        </View>
      </View>
      <SectionHeader icon="pulse-outline" title="Clinical note" caption="Capture the diagnosis and observations" optional />
      <View style={styles.card}><TextInput value={clinicalNote} onChangeText={setClinicalNote} style={styles.noteInput} multiline placeholder="Symptoms, diagnosis, observations or care instructions…" placeholderTextColor={COLORS.muted} textAlignVertical="top" /></View>
      <View style={styles.prescriptionHeading}><SectionHeader icon="document-text-outline" title="Digital prescription" caption="Add medication for this care plan" /><View style={styles.rxPill}><Text style={styles.rxPillText}>Rx</Text></View></View>
      {medicines.map((medicine, index) => (
        <View style={styles.medicineCard} key={medicine.id}>
          <View style={styles.medicineHeader}><View style={styles.medicineNumber}><Text style={styles.medicineNumberText}>{index + 1}</Text></View><Text style={styles.medicineTitle}>Medicine {index + 1}</Text><Pressable onPress={() => removeMedicine(medicine.id)} hitSlop={8} style={styles.removeButton}><Ionicons name="trash-outline" size={17} color={COLORS.red} /></Pressable></View>
          <TextInput value={medicine.name} onChangeText={value => updateMedicine(medicine.id, 'name', value)} style={styles.fullInput} placeholder="Medicine name" placeholderTextColor={COLORS.muted} />
          <View style={styles.medicineFields}><TextInput value={medicine.dose} onChangeText={value => updateMedicine(medicine.id, 'dose', value)} style={[styles.smallInput, { flex: 0.8 }]} placeholder="Dose" placeholderTextColor={COLORS.muted} /><Pressable style={[styles.smallInput, styles.selectInput]}><Text style={styles.selectText}>{medicine.timing}</Text><Ionicons name="chevron-down" size={14} color={COLORS.muted} /></Pressable></View>
          <Pressable style={styles.durationRow}><Ionicons name="calendar-clear-outline" size={15} color={COLORS.muted} /><Text style={styles.durationText}>{medicine.duration}</Text><Ionicons name="chevron-down" size={14} color={COLORS.muted} /></Pressable>
        </View>
      ))}
      <Pressable onPress={addMedicine} style={styles.addMedicine}><View style={styles.addIcon}><Ionicons name="add" size={18} color={COLORS.blue} /></View><Text style={styles.addText}>Add another medicine</Text></Pressable>
      <View style={styles.safetyNote}><Ionicons name="shield-checkmark-outline" size={18} color={COLORS.mintText} /><Text style={styles.safetyText}>Review allergies and interactions before issuing the prescription.</Text></View>
      <FooterButton icon="document-text" label={saving ? 'Issuing…' : 'Generate prescription'} onPress={issuePrescription} busy={saving} />
    </ScrollView>
  );
}

function SectionHeader({ icon, title, caption, optional = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; caption: string; optional?: boolean }) {
  return <View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name={icon} size={16} color={COLORS.blue} /></View><View style={{ flex: 1 }}><View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{title}</Text>{optional && <Text style={styles.optionalText}>OPTIONAL</Text>}</View><Text style={styles.sectionCaption}>{caption}</Text></View></View>;
}
function LabeledInput({ label, icon, ...props }: { label: string; icon?: React.ComponentProps<typeof Ionicons>['name'] } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputRow}><TextInput style={styles.fieldInput} placeholderTextColor={COLORS.muted} {...props} />{icon && <Ionicons name={icon} size={17} color={COLORS.muted} />}</View></View>;
}
function FooterButton({ icon, label, onPress, busy = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; busy?: boolean }) {
  return <Pressable style={[styles.primaryAction, busy && styles.primaryActionBusy]} onPress={onPress} disabled={busy}>{busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name={icon} size={18} color="#FFFFFF" />}<Text style={styles.primaryActionText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#10233F66' },
  prescriptionModal: { width: '100%', maxHeight: '82%', borderRadius: 20, overflow: 'hidden', backgroundColor: COLORS.canvas, shadowColor: '#10233F', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 24, elevation: 12 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.card },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  modalCloseBtn: { padding: 4 },

  content: { padding: 16, paddingTop: 8, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 9, marginTop: 2 }, sectionIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: COLORS.blueSoft, marginRight: 9 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.ink }, sectionCaption: { marginTop: 1, fontSize: 11, color: COLORS.muted }, optionalText: { fontSize: 8, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.6 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, marginBottom: 20, paddingHorizontal: 14 }, inputGroup: { flex: 1, paddingVertical: 13 }, inputLabel: { fontSize: 9, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.7 }, inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 }, fieldInput: { flex: 1, padding: 0, fontSize: 14, fontWeight: '600', color: COLORS.ink }, formDivider: { height: 1, backgroundColor: COLORS.line }, twoColumns: { flexDirection: 'row' }, columnDivider: { width: 1, backgroundColor: COLORS.line, marginVertical: 12, marginHorizontal: 13 },
  noteInput: { minHeight: 92, paddingVertical: 13, fontSize: 13, lineHeight: 19, color: COLORS.ink }, prescriptionHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, rxPill: { marginTop: 4, borderRadius: 8, backgroundColor: COLORS.blue, paddingHorizontal: 8, paddingVertical: 4 }, rxPillText: { fontSize: 11, fontWeight: '900', fontStyle: 'italic', color: '#FFFFFF' },
  medicineCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, marginBottom: 10, padding: 13 }, medicineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 }, medicineNumber: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft }, medicineNumberText: { color: COLORS.blue, fontSize: 11, fontWeight: '800' }, medicineTitle: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.ink, fontWeight: '800' }, removeButton: { padding: 4 }, fullInput: { height: 42, borderRadius: 10, backgroundColor: COLORS.canvas, paddingHorizontal: 11, fontSize: 13, color: COLORS.ink }, medicineFields: { flexDirection: 'row', gap: 8, marginTop: 8 }, smallInput: { flex: 1, height: 40, borderRadius: 10, backgroundColor: COLORS.canvas, paddingHorizontal: 11, fontSize: 12, color: COLORS.ink }, selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectText: { fontSize: 12, color: COLORS.ink }, durationRow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }, durationText: { fontSize: 11, color: COLORS.muted },
  addMedicine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9AB9FC', backgroundColor: '#F9FBFF', marginBottom: 16 }, addIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft }, addText: { color: COLORS.blue, fontSize: 13, fontWeight: '800' },
  safetyNote: { flexDirection: 'row', gap: 9, marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: COLORS.mint }, safetyText: { flex: 1, color: '#27765D', fontSize: 11, lineHeight: 16 },
  primaryAction: { height: 48, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blue }, primaryActionBusy: { opacity: 0.7 }, primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
