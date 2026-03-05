import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Animated
} from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRaceStore } from '../store/raceStore';
import { useProfileStore } from '../store/profileStore';
import AddRaceModal from '../components/AddRaceModal';
import { colors, typography, spacing, radius } from '../constants/theme';

const DISTANCE_LABELS = { S: 'Sprint', M: 'Olympique', L: 'Half', XL: 'Ironman' };

function HeroCardEmpty({ onAdd, t }) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroAccentBar} />
      <View style={styles.heroEmptyBody}>
        <View style={styles.heroOrbsRow}>
          <View style={[styles.heroOrb, { backgroundColor: `${colors.swim}12` }]}>
            <Text style={styles.heroOrbEmoji}>🏊</Text>
          </View>
          <View style={[styles.heroOrb, { backgroundColor: `${colors.bike}12` }]}>
            <Text style={styles.heroOrbEmoji}>🚴</Text>
          </View>
          <View style={[styles.heroOrb, { backgroundColor: `${colors.run}12` }]}>
            <Text style={styles.heroOrbEmoji}>🏃</Text>
          </View>
        </View>
        <Text style={styles.heroEmptyTitle}>
          {t('home.no_races_title')}
        </Text>
        <Text style={styles.heroEmptySub}>
          {t('home.no_races_sub')}
        </Text>
        <TouchableOpacity style={styles.heroEmptyCta} onPress={onAdd} activeOpacity={0.85}>
          <Text style={styles.heroEmptyCtaText}>{t('home.add_race')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HeroCard({ race, onPress, onDelete, getChecklistProgress, t }) {
  const daysUntil = Math.ceil((new Date(race.date) - new Date()) / (1000 * 60 * 60 * 24));
  const { done, total, percent } = getChecklistProgress(race.id);
  const distLabel = DISTANCE_LABELS[race.distance] || race.distance;

  return (
    <TouchableOpacity
      style={styles.heroCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Gradient accent top bar */}
      <View style={styles.heroAccentBar} />

      <View style={styles.heroBody}>
        {/* Top row */}
        <View style={styles.heroTopRow}>
          <View style={styles.heroDistPill}>
            <Text style={styles.heroDistPillText}>{distLabel.toUpperCase()}</Text>
          </View>
          <View style={styles.heroTopRight}>
            <Text style={styles.heroDate}>
              {new Date(race.date).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </Text>
            <TouchableOpacity
              style={styles.heroDeleteBtn}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.heroDeleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Race name */}
        <Text style={styles.heroName} numberOfLines={2}>{race.name}</Text>

        {/* Countdown */}
        <View style={styles.heroCountdownRow}>
          <Text style={styles.heroCountdownNum}>{Math.abs(daysUntil)}</Text>
          <Text style={styles.heroCountdownLabel}>
            {daysUntil >= 0 ? t('home.days_remaining') : t('race_detail.days_since')}
          </Text>
        </View>

        {/* Discipline chips */}
        <View style={styles.heroDiscRow}>
          <View style={[styles.heroDiscChip, { backgroundColor: `${colors.swim}10`, borderColor: `${colors.swim}25` }]}>
            <Text style={styles.heroDiscEmoji}>🏊</Text>
            <Text style={[styles.heroDiscLabel, { color: colors.swim }]}>SWIM</Text>
          </View>
          <View style={[styles.heroDiscChip, { backgroundColor: `${colors.bike}10`, borderColor: `${colors.bike}25` }]}>
            <Text style={styles.heroDiscEmoji}>🚴</Text>
            <Text style={[styles.heroDiscLabel, { color: colors.bike }]}>BIKE</Text>
          </View>
          <View style={[styles.heroDiscChip, { backgroundColor: `${colors.run}10`, borderColor: `${colors.run}25` }]}>
            <Text style={styles.heroDiscEmoji}>🏃</Text>
            <Text style={[styles.heroDiscLabel, { color: colors.run }]}>RUN</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.heroProgressLabelRow}>
          <Text style={styles.heroProgressLabelText}>{t('home.checklist')}</Text>
          <Text style={styles.heroProgressPct}>{percent}%</Text>
        </View>
        <View style={styles.heroProgressBar}>
          <View style={[styles.heroProgressFill, { width: `${percent}%` }]} />
        </View>

        {/* Mini stats */}
        <View style={styles.heroMiniStats}>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniVal}>{done}/{total}</Text>
            <Text style={styles.heroMiniLabel}>{t('home.checklist')}</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniVal}>{(race.reminders || []).length}</Text>
            <Text style={styles.heroMiniLabel}>{t('home.reminders')}</Text>
          </View>
          <View style={[styles.heroMiniStat, styles.heroMiniCta]}>
            <Text style={styles.heroMiniCtaText}>{t('home.see')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SecondaryCard({ race, onPress, onDelete, t }) {
  const daysUntil = Math.ceil((new Date(race.date) - new Date()) / (1000 * 60 * 60 * 24));
  const distLabel = DISTANCE_LABELS[race.distance] || race.distance;

  return (
    <TouchableOpacity style={styles.secondaryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.secondaryLeft}>
        <Text style={styles.secondaryDist}>{distLabel.toUpperCase()}</Text>
        <Text style={styles.secondaryName} numberOfLines={1}>{race.name}</Text>
        <Text style={styles.secondaryDays}>
          {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>
      <View style={styles.secondaryRight}>
        <Text style={styles.secondaryCountdown}>{Math.abs(daysUntil)}</Text>
        <Text style={styles.secondaryDaysLabel}>{t('common.days')}</Text>
      </View>
      <TouchableOpacity
        style={styles.secondaryDeleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.secondaryDeleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const { loadFromStorage, getUpcomingRaces, getChecklistProgress, deleteRace } = useRaceStore();
  const { loadFromStorage: loadProfile } = useProfileStore();

  useEffect(() => { loadFromStorage(); loadProfile(); }, []);

  const upcoming = getUpcomingRaces();
  const [heroRace, ...otherRaces] = upcoming;

  const handleDelete = (race) => {
    Alert.alert(
      t('race_detail.delete_title'),
      t('race_detail.delete_message', { name: race.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteRace(race.id) },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero — course principale ou vide */}
      {heroRace ? (
        <HeroCard
          race={heroRace}
          t={t}
          getChecklistProgress={getChecklistProgress}
          onPress={() => navigation.navigate('RaceDetail', { raceId: heroRace.id })}
          onDelete={() => handleDelete(heroRace)}
        />
      ) : (
        <HeroCardEmpty t={t} onAdd={() => setModalVisible(true)} />
      )}

      {/* Courses secondaires */}
      {otherRaces.length > 0 && (
        <View style={styles.secondarySection}>
          <Text style={styles.secondarySectionLabel}>
            {t('home.other_races', { defaultValue: 'Autres courses' })}
          </Text>
          {otherRaces.map(race => (
            <SecondaryCard
              key={race.id}
              race={race}
              t={t}
              onPress={() => navigation.navigate('RaceDetail', { raceId: race.id })}
              onDelete={() => handleDelete(race)}
            />
          ))}
        </View>
      )}

      {/* Bouton ajouter — visible seulement s'il y a déjà au moins une course */}
      {heroRace && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>{t('home.add_race')}</Text>
        </TouchableOpacity>
      )}

      <AddRaceModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroAccentBar: {
    height: 3,
    backgroundColor: 'transparent',
    // Gradient simulé via une view avec 3 segments
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heroBody: { padding: spacing.lg },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  heroDistPill: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  heroDistPillText: { color: colors.primary, fontWeight: '700', fontSize: 10, letterSpacing: 0.5 },
  heroTopRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroDate: { ...typography.caption, fontSize: 11 },
  heroDeleteBtn: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1, borderColor: `${colors.danger}40`,
    alignItems: 'center', justifyContent: 'center',
  },
  heroDeleteText: { color: colors.danger, fontSize: 11, fontWeight: '700' },

  heroName: {
    fontWeight: '900', fontSize: 28,
    color: colors.textPrimary, letterSpacing: -0.5,
    lineHeight: 30, marginBottom: spacing.sm,
  },

  heroCountdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroCountdownNum: {
    fontSize: 80, fontWeight: '900',
    color: colors.primary, lineHeight: 80,
    letterSpacing: -4,
  },
  heroCountdownLabel: {
    fontSize: 14, color: colors.textSecondary,
    paddingBottom: 12, lineHeight: 18,
  },

  heroDiscRow: {
    flexDirection: 'row', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroDiscChip: {
    flex: 1, borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    gap: 2,
  },
  heroDiscEmoji: { fontSize: 18 },
  heroDiscLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  heroProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  heroProgressLabelText: { ...typography.caption, fontSize: 11 },
  heroProgressPct: { fontSize: 11, fontWeight: '700', color: colors.primary },
  heroProgressBar: {
    height: 4, backgroundColor: colors.surface2,
    borderRadius: radius.full, overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroProgressFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: radius.full,
  },

  heroMiniStats: {
    flexDirection: 'row', gap: spacing.sm,
  },
  heroMiniStat: {
    flex: 1, backgroundColor: colors.surface2,
    borderRadius: radius.md, padding: spacing.sm,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  heroMiniVal: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  heroMiniLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 1 },
  heroMiniCta: {
    backgroundColor: `${colors.primary}12`,
    borderColor: `${colors.primary}30`,
  },
  heroMiniCtaText: { fontSize: 13, fontWeight: '700', color: colors.primary },

  // ── Hero vide ──
  heroEmptyBody: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroOrbsRow: {
    flexDirection: 'row', gap: 10, marginBottom: spacing.lg,
  },
  heroOrb: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  heroOrbEmoji: { fontSize: 26 },
  heroEmptyTitle: {
    ...typography.h3, fontSize: 20,
    textAlign: 'center', marginBottom: spacing.xs,
  },
  heroEmptySub: {
    ...typography.caption,
    textAlign: 'center', marginBottom: spacing.lg,
  },
  heroEmptyCta: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  heroEmptyCtaText: {
    color: colors.bg, fontWeight: '900', fontSize: 16,
  },

  // ── Secondary cards ──
  secondarySection: { marginBottom: spacing.md },
  secondarySectionLabel: {
    ...typography.label, marginBottom: spacing.sm,
  },
  secondaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  secondaryLeft: { flex: 1 },
  secondaryDist: {
    fontSize: 9, fontWeight: '700',
    color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 2,
  },
  secondaryName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  secondaryDays: { ...typography.caption, fontSize: 11 },
  secondaryRight: { alignItems: 'flex-end', marginRight: spacing.md },
  secondaryCountdown: {
    fontWeight: '900', fontSize: 28,
    color: colors.textSecondary, letterSpacing: -1,
  },
  secondaryDaysLabel: { fontSize: 9, fontWeight: '700', color: colors.textDim, letterSpacing: 0.5 },
  secondaryDeleteBtn: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 1, borderColor: `${colors.danger}40`,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryDeleteText: { color: colors.danger, fontSize: 11, fontWeight: '700' },

  // ── Add button ──
  addBtn: {
    borderRadius: radius.lg,
    borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.md, alignItems: 'center',
  },
  addBtnText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
});
