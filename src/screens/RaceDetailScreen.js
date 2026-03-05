import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRaceStore } from '../store/raceStore';
import { colors, typography, spacing, radius } from '../constants/theme';

const DISTANCE_INFO = {
  S:  { label: 'Sprint',    sub: '750m · 20km · 5km' },
  M:  { label: 'Olympique', sub: '1.5km · 40km · 10km' },
  L:  { label: 'Half',      sub: '1.9km · 90km · 21km' },
  XL: { label: 'Ironman',   sub: '3.8km · 180km · 42km' },
};

const DISCIPLINES = [
  { key: 'swim', emoji: '🏊', label: 'Swim', color: colors.swim },
  { key: 'bike', emoji: '🚴', label: 'Bike', color: colors.bike },
  { key: 'run',  emoji: '🏃', label: 'Run',  color: colors.run  },
];

export default function RaceDetailScreen({ route, navigation }) {
  const { raceId } = route.params;
  const {
    getRace, deleteRace,
    getChecklistProgress, getPreRaceProgress,
    getDebrief,
  } = useRaceStore();

  const race = getRace(raceId);
  if (!race) return null;

  const progress       = getChecklistProgress(raceId);
  const preRaceProgress = getPreRaceProgress(raceId);
  const debrief        = getDebrief(raceId);
  const dist           = DISTANCE_INFO[race.distance] || {};

  const daysUntil = Math.ceil((new Date(race.date) - new Date()) / (1000 * 60 * 60 * 24));
  const isPast    = daysUntil < 0;

  const handleDelete = () => {
    Alert.alert(
      'Supprimer cette course ?',
      `"${race.name}" et toutes ses données seront supprimées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: async () => {
          await deleteRace(raceId);
          navigation.goBack();
        }},
      ]
    );
  };

  const PREP_ITEMS = [
    {
      key: 'Checklist',
      screen: 'Checklist',
      emoji: '✅',
      color: colors.swim,
      getSub:   () => `${progress.done}/${progress.total} équipements vérifiés`,
      getVal:   () => `${progress.percent}%`,
      getColor: () => colors.primary,
      getProgress: () => progress.percent,
    },
    {
      key: 'Veille de course',
      screen: 'PreRaceChecklist',
      emoji: '🌙',
      color: colors.bike,
      getSub:   () => `${preRaceProgress.done}/${preRaceProgress.total} tâches complétées`,
      getVal:   () => `${preRaceProgress.percent}%`,
      getColor: () => colors.bike,
      getProgress: () => preRaceProgress.percent,
    },
    {
      key: 'Rappels',
      screen: 'Reminders',
      emoji: '🔔',
      color: colors.run,
      getSub:   () => `${(race.reminders || []).length} rappel(s) programmé(s)`,
      getVal:   () => `${(race.reminders || []).length}`,
      getColor: () => (race.reminders || []).length > 0 ? colors.run : colors.textSecondary,
      getProgress: () => null,
    },
    {
      key: 'Débrief',
      screen: 'Debrief',
      emoji: '📊',
      color: colors.primary,
      getSub:   () => debrief ? 'Débrief complété ✓' : 'À remplir après la course',
      getVal:   () => debrief ? '✓' : '—',
      getColor: () => debrief ? colors.run : colors.textSecondary,
      getProgress: () => null,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.distTag}>
            <Text style={styles.distTagText}>
              {dist.label?.toUpperCase() || race.distance}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.raceName}>{race.name}</Text>
        <Text style={styles.raceDate}>
          {new Date(race.date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </Text>
        {dist.sub && <Text style={styles.raceDist}>{dist.sub}</Text>}

        <View style={styles.countdownRow}>
          <Text style={[styles.countdownNum, isPast && { color: colors.textSecondary }]}>
            {Math.abs(daysUntil)}
          </Text>
          <Text style={styles.countdownLabel}>
            {isPast ? 'jours depuis la course' : 'jours restants'}
          </Text>
        </View>
      </View>

      {/* Disciplines */}
      <View style={styles.disciplinesRow}>
        {DISCIPLINES.map(d => (
          <View key={d.key} style={styles.disciplineCard}>
            <Text style={styles.disciplineEmoji}>{d.emoji}</Text>
            <Text style={[styles.disciplineLabel, { color: d.color }]}>{d.label}</Text>
          </View>
        ))}
      </View>

      {/* Prep items */}
      <Text style={styles.sectionLabel}>Préparation</Text>
      <View style={styles.prepCard}>
        {PREP_ITEMS.map((item, index) => {
          const val      = item.getVal();
          const sub      = item.getSub();
          const valColor = item.getColor();
          const pct      = item.getProgress();

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.prepItem,
                index < PREP_ITEMS.length - 1 && styles.prepItemBorder,
              ]}
              onPress={() => navigation.navigate(item.screen, { raceId })}
              activeOpacity={0.7}
            >
              <View style={[styles.prepIcon, { backgroundColor: `${item.color}12` }]}>
                <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
              </View>
              <View style={styles.prepInfo}>
                <Text style={styles.prepTitle}>{item.key}</Text>
                <Text style={styles.prepSub}>{sub}</Text>
                {pct !== null && (
                  <View style={styles.prepProgressBar}>
                    <View style={[
                      styles.prepProgressFill,
                      { width: `${pct}%`, backgroundColor: item.color }
                    ]} />
                  </View>
                )}
              </View>
              <View style={styles.prepRight}>
                <Text style={[styles.prepVal, { color: valColor }]}>{val}</Text>
                <Text style={styles.prepArrow}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },

  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  distTag: {
    backgroundColor: colors.primaryDim,
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  distTagText: { color: colors.primary, fontWeight: '700', fontSize: 11, letterSpacing: 1 },
  deleteBtn: {
    width: 30, height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.danger}40`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { color: colors.danger, fontSize: 13, fontWeight: '700' },

  raceName: { ...typography.h1, marginBottom: spacing.xs },
  raceDate: { ...typography.caption, marginBottom: 2 },
  raceDist: { ...typography.caption, color: colors.textDim, marginBottom: spacing.md },

  countdownRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  countdownNum: {
    fontSize: 64, fontWeight: '900',
    color: colors.primary, lineHeight: 68, letterSpacing: -3,
  },
  countdownLabel: { ...typography.body, color: colors.textSecondary },

  disciplinesRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  disciplineCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disciplineEmoji: { fontSize: 24, marginBottom: 4 },
  disciplineLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  sectionLabel: { ...typography.label, marginBottom: spacing.sm },

  prepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  prepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  prepItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  prepIcon: {
    width: 44, height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prepInfo: { flex: 1 },
  prepTitle: { ...typography.body, fontWeight: '600', marginBottom: 2 },
  prepSub: { ...typography.caption, fontSize: 12 },
  prepProgressBar: {
    height: 3,
    backgroundColor: colors.surface2,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  prepProgressFill: { height: '100%', borderRadius: 2 },
  prepRight: { alignItems: 'flex-end', gap: 2 },
  prepVal: { fontSize: 16, fontWeight: '800' },
  prepArrow: { color: colors.textDim, fontSize: 18 },
});
