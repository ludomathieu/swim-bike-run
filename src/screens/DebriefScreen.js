import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRaceStore } from '../store/raceStore';
import { colors, typography, spacing, radius } from '../constants/theme';

const SEGMENTS = [
  { key: 'swimTime',     label: '🏊 Natation',  color: colors.swim },
  { key: 'transitionT1', label: '🔄 T1',        color: colors.textSecondary },
  { key: 'bikeTime',     label: '🚴 Vélo',      color: colors.bike },
  { key: 'transitionT2', label: '🔄 T2',        color: colors.textSecondary },
  { key: 'runTime',      label: '🏃 Course',    color: colors.run },
];

const RATINGS = [
  { key: 'swimRating',    label: '🏊 Natation' },
  { key: 'bikeRating',    label: '🚴 Vélo' },
  { key: 'runRating',     label: '🏃 Course' },
  { key: 'globalFeeling', label: '⭐ Global' },
];

const INITIAL = {
  swimTime: '', bikeTime: '', runTime: '', transitionT1: '', transitionT2: '',
  swimRating: 3, bikeRating: 3, runRating: 3, globalFeeling: 3,
  whatWorked: '', toImprove: '', nextGoal: '',
};

function parseTime(t) {
  if (!t) return 0;
  const p = t.split(':').map(Number);
  return (p[0] || 0) * 3600 + (p[1] || 0) * 60 + (p[2] || 0);
}

function formatTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

export default function DebriefScreen({ route }) {
  const { raceId } = route.params;
  const { getRace, addDebrief, getDebrief } = useRaceStore();
  const race = getRace(raceId);
  const existing = getDebrief(raceId);

  const [form, setForm] = useState(existing || INITIAL);
  const [tab, setTab] = useState(existing ? 'view' : 'form');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const totalSecs = SEGMENTS.reduce((acc, s) => acc + parseTime(form[s.key]), 0);

  const save = async () => {
    await addDebrief({ ...form, raceId, totalTime: formatTime(totalSecs) });
    Alert.alert('✅ Débrief sauvegardé !');
    setTab('view');
  };

  if (!race) return null;

  return (
    <View style={styles.wrapper}>
      {/* Tabs — seulement si débrief existant */}
      {existing && (
        <View style={styles.tabs}>
          {['view', 'form'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'view' ? 'Résumé' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {tab === 'view' && existing ? (
          // VIEW MODE
          <>
            <View style={styles.card}>
              <Text style={styles.totalTime}>{existing.totalTime}</Text>
              <Text style={styles.totalLabel}>Temps total</Text>
              <View style={styles.segmentsGrid}>
                {SEGMENTS.filter(s => existing[s.key]).map(s => (
                  <View key={s.key} style={styles.segmentChip}>
                    <View style={[styles.segDot, { backgroundColor: s.color }]} />
                    <Text style={styles.segLabel}>{s.label.split(' ')[1] || s.label}</Text>
                    <Text style={[styles.segVal, { color: s.color }]}>{existing[s.key]}</Text>
                  </View>
                ))}
              </View>
            </View>

            <Text style={styles.sectionLabel}>RESSENTI</Text>
            <View style={styles.card}>
              {RATINGS.map((r, i) => (
                <View key={r.key} style={[styles.ratingRow, i < RATINGS.length - 1 && styles.rowBorder]}>
                  <Text style={styles.ratingLabel}>{r.label}</Text>
                  <Text style={styles.ratingStars}>
                    {'★'.repeat(existing[r.key])}{'☆'.repeat(5 - existing[r.key])}
                  </Text>
                </View>
              ))}
            </View>

            {[['whatWorked', '✅ Ce qui a bien marché'], ['toImprove', '🔧 À améliorer'], ['nextGoal', '🎯 Prochain objectif']].map(([key, label]) =>
              existing[key] ? (
                <View key={key} style={styles.analysisCard}>
                  <Text style={styles.analysisCardLabel}>{label}</Text>
                  <Text style={styles.analysisCardText}>{existing[key]}</Text>
                </View>
              ) : null
            )}
          </>
        ) : (
          // FORM MODE
          <>
            <Text style={styles.sectionLabel}>TEMPS PAR SEGMENT</Text>
            <View style={styles.card}>
              {SEGMENTS.map((seg, index) => (
                <View key={seg.key} style={[styles.segmentRow, index < SEGMENTS.length - 1 && styles.rowBorder]}>
                  <View style={[styles.segDot, { backgroundColor: seg.color }]} />
                  <Text style={styles.segmentLabel}>{seg.label}</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="00:00:00"
                    placeholderTextColor={colors.textDim}
                    value={form[seg.key]}
                    onChangeText={v => set(seg.key, v)}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>TOTAL</Text>
                <Text style={styles.totalRowVal}>{formatTime(totalSecs)}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>RESSENTI</Text>
            <View style={styles.card}>
              {RATINGS.map((r, index) => (
                <View key={r.key} style={[styles.ratingRow, index < RATINGS.length - 1 && styles.rowBorder]}>
                  <Text style={styles.ratingLabel}>{r.label}</Text>
                  <View style={styles.stars}>
                    {[1,2,3,4,5].map(n => (
                      <TouchableOpacity key={n} onPress={() => set(r.key, n)}>
                        <Text style={[styles.star, { opacity: n <= form[r.key] ? 1 : 0.15 }]}>★</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>ANALYSE</Text>
            <View style={styles.card}>
              {[['whatWorked', '✅ Ce qui a bien fonctionné', colors.run],
                ['toImprove',  '🔧 À améliorer',             colors.bike],
                ['nextGoal',   '🎯 Prochain objectif',       colors.swim],
              ].map(([key, label, color], index, arr) => (
                <View key={key} style={index < arr.length - 1 && styles.rowBorder}>
                  <Text style={[styles.analysisLabel, { color }]}>{label}</Text>
                  <TextInput
                    style={styles.textarea}
                    multiline numberOfLines={3}
                    placeholder="..." placeholderTextColor={colors.textDim}
                    value={form[key]}
                    onChangeText={v => set(key, v)}
                    textAlignVertical="top"
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveBtnText}>💾 Sauvegarder le débrief</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.body, fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.primary, fontWeight: '700' },

  container: { flex: 1 },
  content: { padding: spacing.md },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm, marginTop: spacing.xs },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },

  // View mode
  totalTime: { fontSize: 48, fontWeight: '900', color: colors.primary, letterSpacing: -2, textAlign: 'center' },
  totalLabel: { ...typography.caption, textAlign: 'center', marginBottom: spacing.md },
  segmentsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  segmentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  segDot: { width: 6, height: 6, borderRadius: 3 },
  segLabel: { fontSize: 12, color: colors.textSecondary },
  segVal: { fontSize: 12, fontWeight: '700' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  ratingLabel: { flex: 1, ...typography.body, fontSize: 14 },
  ratingStars: { fontSize: 16, color: colors.primary },
  stars: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 24, color: colors.primary },

  analysisCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  analysisCardLabel: { ...typography.caption, marginBottom: spacing.sm },
  analysisCardText: { ...typography.body, fontSize: 14 },

  // Form mode
  segmentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: spacing.sm },
  segmentLabel: { flex: 1, ...typography.body, fontSize: 14 },
  timeInput: { width: 100, backgroundColor: colors.surface2, borderRadius: radius.sm, padding: spacing.sm, textAlign: 'center', fontSize: 14, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, fontWeight: '600' },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, marginTop: spacing.xs, borderTopWidth: 1, borderTopColor: `${colors.primary}30` },
  totalRowLabel: { flex: 1, ...typography.label },
  totalRowVal: { fontSize: 24, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },

  analysisLabel: { fontSize: 13, fontWeight: '700', marginTop: spacing.md, marginBottom: spacing.sm },
  textarea: { backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md, fontSize: 14, color: colors.textPrimary, minHeight: 80, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },

  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  saveBtnText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
});
