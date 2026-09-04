import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { ink: '#10233F', muted: '#728197', blue: '#246BFD', blueSoft: '#EEF4FF', mint: '#E9FAF4', mintText: '#12956A', canvas: '#F6F8FC', card: '#FFFFFF', line: '#E4EAF2', red: '#E5484D' };
type Medicine = { id: number; name: string; dose: string; timing: string; duration: string };
const emptyMedicine = (id: number): Medicine => ({ id, name: '', dose: '', timing: 'After food', duration: '5 days' });

type WorkspaceMode = 'appoint' | 'prescribe' | null;

export default function DoctorWorkspace() {
  const [activeModal, setActiveModal] = useState<WorkspaceMode>(null);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerIcon}><Ionicons name="medical" size={20} color={COLORS.blue} /></View>
        <View style={styles.headerCopy}><Text style={styles.title}>Workspace</Text><Text style={styles.subtitle}>What would you like to do today?</Text></View>
        <View style={styles.draftPill}><View style={styles.draftDot} /><Text style={styles.draftText}>DR</Text></View>
      </View>

      {/* Dashboard Actions */}
      <View style={styles.dashboardContainer}>
        <Pressable style={styles.dashboardCard} onPress={() => setActiveModal('appoint')}>
          <View style={[styles.dashboardCardIcon, { backgroundColor: COLORS.blueSoft }]}>
            <Ionicons name="calendar-outline" size={32} color={COLORS.blue} />
          </View>
          <Text style={styles.dashboardCardTitle}>Book Appointment</Text>
          <Text style={styles.dashboardCardSubtitle}>Schedule a new visit</Text>
        </Pressable>

        <Pressable style={styles.dashboardCard} onPress={() => setActiveModal('prescribe')}>
          <View style={[styles.dashboardCardIcon, { backgroundColor: COLORS.mint }]}>
            <Ionicons name="document-text-outline" size={32} color={COLORS.mintText} />
          </View>
          <Text style={styles.dashboardCardTitle}>New Prescription</Text>
          <Text style={styles.dashboardCardSubtitle}>Write a care plan</Text>
        </Pressable>
      </View>

      {/* Modals */}
      <Modal visible={activeModal === 'appoint'} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <Pressable onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.ink} />
            </Pressable>
          </View>
          <AppointPatient onClose={() => setActiveModal(null)} />
        </SafeAreaView>
      </Modal>

      <Modal visible={activeModal === 'prescribe'} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActiveModal(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Prescription</Text>
            <Pressable onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.ink} />
            </Pressable>
          </View>
          <NewPrescription onClose={() => setActiveModal(null)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function AppointPatient({ onClose }: { onClose: () => void }) {
  const [visitType, setVisitType] = useState<'Video' | 'In-clinic'>('Video');
  const [date, setDate] = useState('Today, 29 Aug');
  const [time, setTime] = useState('10:30 AM');
  const bookAppointment = () => {
    Alert.alert('Appointment booked', 'The patient has been added to your schedule and will receive a confirmation.');
    onClose();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <SectionHeader icon="person-outline" title="Patient details" caption="Who needs the appointment?" />
      <View style={styles.card}>
        <LabeledInput label="PATIENT NAME" placeholder="Search or enter patient name" icon="search-outline" />
        <View style={styles.formDivider} />
        <View style={styles.twoColumns}>
          <LabeledInput label="AGE" placeholder="e.g. 34" keyboardType="number-pad" />
          <View style={styles.columnDivider} />
          <LabeledInput label="PHONE" placeholder="+91 00000 00000" keyboardType="phone-pad" />
        </View>
      </View>
      <SectionHeader icon="calendar-outline" title="Appointment details" caption="When and how will you connect?" />
      <View style={styles.card}>
        <View style={styles.detailRow}>
          <DetailOption icon="calendar-number-outline" label="Date" value={date} onPress={() => setDate(date === 'Today, 29 Aug' ? 'Tomorrow, 30 Aug' : 'Today, 29 Aug')} />
          <View style={styles.rowDivider} />
          <DetailOption icon="time-outline" label="Time" value={time} onPress={() => setTime(time === '10:30 AM' ? '11:00 AM' : '10:30 AM')} />
        </View>
        <View style={styles.formDivider} />
        <VisitModeRow type={visitType} onChange={setVisitType} />
      </View>
      <SectionHeader icon="chatbubble-outline" title="Reason for visit" caption="Why does this patient need care?" optional />
      <View style={styles.card}><TextInput style={styles.noteInput} multiline placeholder="Chief complaint, symptoms or follow-up notes…" placeholderTextColor={COLORS.muted} textAlignVertical="top" /></View>
      <View style={styles.safetyNote}><Ionicons name="checkmark-circle-outline" size={18} color={COLORS.mintText} /><Text style={styles.safetyText}>The patient will be notified once the appointment is confirmed.</Text></View>
      <FooterButton icon="calendar" label="Book appointment" onPress={bookAppointment} />
    </ScrollView>
  );
}

function NewPrescription({ onClose }: { onClose: () => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([emptyMedicine(1)]);
  const [nextMedicineId, setNextMedicineId] = useState(2);
  const updateMedicine = (id: number, field: keyof Omit<Medicine, 'id'>, value: string) => setMedicines(current => current.map(medicine => medicine.id === id ? { ...medicine, [field]: value } : medicine));
  const addMedicine = () => { setMedicines(current => [...current, emptyMedicine(nextMedicineId)]); setNextMedicineId(current => current + 1); };
  const removeMedicine = (id: number) => {
    if (medicines.length === 1) { setMedicines([emptyMedicine(nextMedicineId)]); setNextMedicineId(current => current + 1); return; }
    setMedicines(current => current.filter(medicine => medicine.id !== id));
  };
  const issuePrescription = () => {
    Alert.alert('Prescription ready', 'The care plan has been finalized and is ready to share with the patient.');
    onClose();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <SectionHeader icon="person-outline" title="Patient details" caption="Who is this prescription for?" />
      <View style={styles.card}>
        <LabeledInput label="PATIENT NAME" placeholder="Search or enter patient name" icon="search-outline" />
        <View style={styles.formDivider} />
        <View style={styles.twoColumns}>
          <LabeledInput label="AGE" placeholder="e.g. 34" keyboardType="number-pad" />
          <View style={styles.columnDivider} />
          <LabeledInput label="WEIGHT" placeholder="e.g. 68 kg" keyboardType="number-pad" />
        </View>
      </View>
      <SectionHeader icon="pulse-outline" title="Clinical note" caption="Capture the diagnosis and observations" optional />
      <View style={styles.card}><TextInput style={styles.noteInput} multiline placeholder="Symptoms, diagnosis, observations or care instructions…" placeholderTextColor={COLORS.muted} textAlignVertical="top" /></View>
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
      <FooterButton icon="document-text" label="Generate prescription" onPress={issuePrescription} />
    </ScrollView>
  );
}

function SectionHeader({ icon, title, caption, optional = false }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; caption: string; optional?: boolean }) {
  return <View style={styles.sectionHeader}><View style={styles.sectionIcon}><Ionicons name={icon} size={16} color={COLORS.blue} /></View><View style={{ flex: 1 }}><View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{title}</Text>{optional && <Text style={styles.optionalText}>OPTIONAL</Text>}</View><Text style={styles.sectionCaption}>{caption}</Text></View></View>;
}
function LabeledInput({ label, icon, ...props }: { label: string; icon?: React.ComponentProps<typeof Ionicons>['name'] } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputRow}><TextInput style={styles.fieldInput} placeholderTextColor={COLORS.muted} {...props} />{icon && <Ionicons name={icon} size={17} color={COLORS.muted} />}</View></View>;
}
function DetailOption({ icon, label, value, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; onPress?: () => void }) {
  return <Pressable style={styles.detailOption} onPress={onPress}><View style={styles.detailTop}><Ionicons name={icon} size={15} color={COLORS.blue} /><Text style={styles.inputLabel}>{label.toUpperCase()}</Text></View><Text style={styles.detailValue}>{value}</Text></Pressable>;
}
function VisitModeRow({ type, onChange }: { type: 'Video' | 'In-clinic'; onChange: (next: 'Video' | 'In-clinic') => void }) {
  return (
    <View style={styles.visitModeRow}>
      <View style={styles.modeIcon}><Ionicons name={type === 'Video' ? 'videocam' : 'business'} size={17} color={COLORS.blue} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.modeTitle}>{type === 'Video' ? 'Video consultation' : 'In-clinic appointment'}</Text>
        <Text style={styles.modeNote}>{type === 'Video' ? 'A secure meeting link will be shared with the patient.' : 'The patient will receive a booking confirmation.'}</Text>
      </View>
      <Pressable onPress={() => onChange(type === 'Video' ? 'In-clinic' : 'Video')} style={styles.toggleRow}>
        <Ionicons name={type === 'Video' ? 'videocam' : 'business'} size={15} color={type === 'Video' ? COLORS.blue : COLORS.muted} />
        <Text style={[styles.toggleText, type === 'Video' ? styles.toggleTextActive : null]}>{type === 'Video' ? 'Video' : 'Clinic'}</Text>
      </Pressable>
    </View>
  );
}
function FooterButton({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return <Pressable style={styles.primaryAction} onPress={onPress}><Ionicons name={icon} size={18} color="#FFFFFF" /><Text style={styles.primaryActionText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.canvas },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  headerIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft },
  headerCopy: { flex: 1, marginLeft: 11 }, title: { fontSize: 19, fontWeight: '800', color: COLORS.ink }, subtitle: { marginTop: 2, fontSize: 12, color: COLORS.muted },
  draftPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 99, backgroundColor: '#EEF4FF', paddingHorizontal: 9, paddingVertical: 5 }, draftDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.blue }, draftText: { fontSize: 9, fontWeight: '800', color: COLORS.blue, letterSpacing: 0.5 },
  
  dashboardContainer: { padding: 20, paddingTop: 60, gap: 20, flex: 1 },
  dashboardCard: { backgroundColor: COLORS.card, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  dashboardCardIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dashboardCardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink, marginBottom: 4 },
  dashboardCardSubtitle: { fontSize: 13, color: COLORS.muted },

  modalContainer: { flex: 1, backgroundColor: COLORS.canvas },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.line, backgroundColor: COLORS.card },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  modalCloseBtn: { padding: 4 },

  content: { padding: 16, paddingTop: 8, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 9, marginTop: 2 }, sectionIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: COLORS.blueSoft, marginRight: 9 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.ink }, sectionCaption: { marginTop: 1, fontSize: 11, color: COLORS.muted }, optionalText: { fontSize: 8, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.6 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, marginBottom: 20, paddingHorizontal: 14 }, inputGroup: { flex: 1, paddingVertical: 13 }, inputLabel: { fontSize: 9, fontWeight: '800', color: COLORS.muted, letterSpacing: 0.7 }, inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 }, fieldInput: { flex: 1, padding: 0, fontSize: 14, fontWeight: '600', color: COLORS.ink }, formDivider: { height: 1, backgroundColor: COLORS.line }, twoColumns: { flexDirection: 'row' }, columnDivider: { width: 1, backgroundColor: COLORS.line, marginVertical: 12, marginHorizontal: 13 },
  detailRow: { flexDirection: 'row' }, detailOption: { flex: 1, paddingVertical: 13 }, detailTop: { flexDirection: 'row', alignItems: 'center', gap: 5 }, detailValue: { marginTop: 7, fontSize: 14, fontWeight: '700', color: COLORS.ink }, rowDivider: { width: 1, backgroundColor: COLORS.line, marginVertical: 12 },
  visitModeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 }, modeIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center' }, modeTitle: { color: COLORS.ink, fontSize: 13, fontWeight: '700' }, modeNote: { color: COLORS.muted, fontSize: 11, marginTop: 2, lineHeight: 15 }, toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 9, paddingVertical: 6 }, toggleText: { fontSize: 11, fontWeight: '700', color: COLORS.muted }, toggleTextActive: { color: COLORS.blue },
  noteInput: { minHeight: 92, paddingVertical: 13, fontSize: 13, lineHeight: 19, color: COLORS.ink }, prescriptionHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }, rxPill: { marginTop: 4, borderRadius: 8, backgroundColor: COLORS.blue, paddingHorizontal: 8, paddingVertical: 4 }, rxPillText: { fontSize: 11, fontWeight: '900', fontStyle: 'italic', color: '#FFFFFF' },
  medicineCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, marginBottom: 10, padding: 13 }, medicineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 }, medicineNumber: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft }, medicineNumberText: { color: COLORS.blue, fontSize: 11, fontWeight: '800' }, medicineTitle: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.ink, fontWeight: '800' }, removeButton: { padding: 4 }, fullInput: { height: 42, borderRadius: 10, backgroundColor: COLORS.canvas, paddingHorizontal: 11, fontSize: 13, color: COLORS.ink }, medicineFields: { flexDirection: 'row', gap: 8, marginTop: 8 }, smallInput: { flex: 1, height: 40, borderRadius: 10, backgroundColor: COLORS.canvas, paddingHorizontal: 11, fontSize: 12, color: COLORS.ink }, selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, selectText: { fontSize: 12, color: COLORS.ink }, durationRow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 }, durationText: { fontSize: 11, color: COLORS.muted },
  addMedicine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9AB9FC', backgroundColor: '#F9FBFF', marginBottom: 16 }, addIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.blueSoft }, addText: { color: COLORS.blue, fontSize: 13, fontWeight: '800' },
  safetyNote: { flexDirection: 'row', gap: 9, marginBottom: 16, padding: 12, borderRadius: 12, backgroundColor: COLORS.mint }, safetyText: { flex: 1, color: '#27765D', fontSize: 11, lineHeight: 16 },
  primaryAction: { height: 48, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.blue }, primaryActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});