import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRaceStore } from '../store/raceStore';
import { useProfileStore } from '../store/profileStore';
import { colors, typography, spacing, radius } from '../constants/theme';

const DISTANCES = [
  { key: 'S',  label: 'Sprint',    sub: '750m/20km/5km' },
  { key: 'M',  label: 'Olympique', sub: '1.5/40/10km' },
  { key: 'L',  label: 'Half',      sub: '1.9/90/21km' },
  { key: 'XL', label: 'Ironman',   sub: '3.8/180/42km' },
];

export default function AddRaceModal({ visible, onClose }) {
  const { addRace } = useRaceStore();
  const { defaultChecklist } = useProfileStore();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [distance, setDistance] = useState('S');
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Nom manquant'); return; }
    await addRace({ name: name.trim(), date: date.toISOString().split('T')[0], distance }, defaultChecklist);
    setName(''); setDate(new Date()); setDistance('S');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle course</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>

          <Text style={styles.fieldLabel}>NOM</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Triathlon de Paris"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.fieldLabel}>FORMAT</Text>
          <View style={styles.distanceGrid}>
            {DISTANCES.map(d => (
              <TouchableOpacity
                key={d.key}
                style={[styles.distBtn, distance === d.key && styles.distBtnActive]}
                onPress={() => setDistance(d.key)}
              >
                <Text style={[styles.distBtnKey, distance === d.key && { color: colors.bg }]}>{d.key}</Text>
                <Text style={[styles.distBtnLabel, distance === d.key && { color: colors.bg }]}>{d.label}</Text>
                <Text style={[styles.distBtnSub, distance === d.key && { color: `${colors.bg}80` }]}>{d.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>DATE</Text>
          {Platform.OS === 'android' && (
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
              <Text style={styles.dateBtnText}>
                📅 {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
          )}
          {(showPicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              style={styles.datePicker}
              themeVariant="dark"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { ...typography.h3 },
  cancelText: { fontSize: 16, color: colors.textSecondary },
  saveText: { fontSize: 16, color: colors.primary, fontWeight: '700' },

  form: { padding: spacing.md },
  fieldLabel: { ...typography.label, marginBottom: spacing.sm, marginTop: spacing.lg },

  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },

  dateBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnText: { fontSize: 15, color: colors.textPrimary },
  datePicker: { backgroundColor: colors.surface },

  distanceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  distBtn: {
    width: '47%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  distBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  distBtnKey: { fontWeight: '900', fontSize: 18, color: colors.textPrimary },
  distBtnLabel: { fontWeight: '600', fontSize: 14, color: colors.textPrimary, marginTop: 2 },
  distBtnSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
