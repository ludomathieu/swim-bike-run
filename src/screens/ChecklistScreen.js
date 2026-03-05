import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated
} from 'react-native';
import { useRef } from 'react';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRaceStore } from '../store/raceStore';
import { useProfileStore } from '../store/profileStore';
import { EQUIPMENT_CATEGORIES } from '../constants/equipment';
import { colors, typography, spacing, radius } from '../constants/theme';

const DISCIPLINE_COLORS = {
  swim: colors.swim,
  bike: colors.bike,
  run: colors.run,
  general: colors.textSecondary,
  nutrition: '#FFB800',
};

function SwipeableItem({ item, checked, accentColor, onToggle, onDelete }) {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
      >
        <Animated.Text style={[styles.deleteActionText, { transform: [{ scale }] }]}>
          🗑
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
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
        <Text style={[
          styles.itemLabel,
          checked && styles.itemLabelDone
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function ChecklistScreen({ route }) {
  const { raceId } = route.params;
  const {
    getRace,
    toggleChecklistItem,
    resetChecklist,
    getChecklistProgress,
    removeChecklistItem,
  } = useRaceStore();

  const race = getRace(raceId);
  if (!race) return null;

  const { done, total, percent } = getChecklistProgress(raceId);
  const checklist = race.checklist || {};

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
              <Text style={styles.progressSub}>prêt pour la course</Text>
            </View>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => resetChecklist(raceId)}
            >
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressCount}>{done}/{total} équipements vérifiés</Text>
        </View>

        {/* Hint swipe */}
        <View style={styles.hintRow}>
          <Text style={styles.hintText}>← Glisser un item pour le supprimer</Text>
        </View>

        {/* Categories */}
        {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => {
          const accentColor = DISCIPLINE_COLORS[key];
          const items = cat.items.filter(item =>
            checklist.hasOwnProperty(item.id)
          );
          if (items.length === 0) return null;
          const catDone = items.filter(i => checklist[i.id]).length;

          return (
            <View key={key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: accentColor }]} />
                <Text style={[styles.sectionTitle, { color: accentColor }]}>
                  {cat.label}
                </Text>
                <Text style={styles.sectionCount}>{catDone}/{items.length}</Text>
              </View>

              {items.map((item) => (
                <SwipeableItem
                  key={item.id}
                  item={item}
                  checked={!!checklist[item.id]}
                  accentColor={accentColor}
                  onToggle={() => toggleChecklistItem(raceId, item.id)}
                  onDelete={() => removeChecklistItem(raceId, item.id)}
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
    marginBottom: spacing.sm,
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
    color: colors.primary,
    letterSpacing: -2,
    lineHeight: 56,
  },
  progressSign: { fontSize: 28, fontWeight: '700', color: colors.primary },
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
    backgroundColor: colors.primary,
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

  hintRow: {
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  hintText: {
    fontSize: 11,
    color: colors.textDim,
    fontStyle: 'italic',
  },

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
  sectionDot: {
    width: 8, height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
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
  },
  checkmark: { color: colors.bg, fontWeight: '800', fontSize: 13 },
  itemLabel: { flex: 1, ...typography.body, fontSize: 14 },
  itemLabelDone: {
    textDecorationLine: 'line-through',
    color: colors.textDim,
  },

  // Swipe delete
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  deleteActionText: { fontSize: 22 },
});