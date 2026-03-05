import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRef } from 'react';
import { useRaceStore } from '../store/raceStore';
import { PRE_RACE_CATEGORIES } from '../constants/equipment';
import { colors, typography, spacing, radius } from '../constants/theme';

function SwipeableItem({ item, checked, accentColor, onToggle }) {
  const swipeableRef = useRef(null);
  return (
    <Swipeable
      ref={swipeableRef}
      overshootRight={false}
      enabled={false} // veille : pas de suppression, items fixes
    >
      <TouchableOpacity
        style={[styles.item, checked && styles.itemDone]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          checked && { backgroundColor: accentColor, borderColor: accentColor }
        ]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.itemLabel, checked && styles.itemLabelDone]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function PreRaceChecklistScreen({ route }) {
  const { raceId } = route.params;
  const {
    getRace,
    togglePreRaceItem,
    resetPreRaceChecklist,
    getPreRaceProgress,
  } = useRaceStore();

  const race = getRace(raceId);
  if (!race) return null;

  const { done, total, percent } = getPreRaceProgress(raceId);
  const checklist = race.preRaceChecklist || {};

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressNum}>
                {percent}<Text style={styles.progressSign}>%</Text>
              </Text>
              <Text style={styles.progressSub}>prêt pour demain</Text>
            </View>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => resetPreRaceChecklist(raceId)}
            >
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressCount}>{done}/{total} tâches complétées</Text>
        </View>

        {/* Categories */}
        {Object.entries(PRE_RACE_CATEGORIES).map(([key, cat]) => {
          const catDone = cat.items.filter(i => checklist[i.id]).length;

          return (
            <View key={key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.sectionTitle, { color: cat.color }]}>
                  {cat.label}
                </Text>
                <Text style={styles.sectionCount}>{catDone}/{cat.items.length}</Text>
              </View>

              {cat.items.map(item => (
                <SwipeableItem
                  key={item.id}
                  item={item}
                  checked={!!checklist[item.id]}
                  accentColor={cat.color}
                  onToggle={() => togglePreRaceItem(raceId, item.id)}
                />
              ))}
            </View>
          );
        })}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },

  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  progressNum: {
    fontSize: 52,
    fontWeight: '900',
    color: colors.bike,
    letterSpacing: -2,
    lineHeight: 56,
  },
  progressSign: { fontSize: 28, fontWeight: '700', color: colors.bike },
  progressSub: { ...typography.caption },
  progressBar: {
    height: 4,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.bike,
    borderRadius: radius.full,
  },
  progressCount: { ...typography.caption },
  resetBtn: {
    borderWidth: 1,
    borderColor: `${colors.danger}40`,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resetText: { color: colors.danger, fontSize: 13, fontWeight: '600' },

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  sectionCount: { ...typography.caption },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemDone: { opacity: 0.4 },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  checkmark: { color: colors.bg, fontWeight: '800', fontSize: 13 },
  itemLabel: { flex: 1, ...typography.body, fontSize: 14 },
  itemLabelDone: { textDecorationLine: 'line-through', color: colors.textDim },
});
