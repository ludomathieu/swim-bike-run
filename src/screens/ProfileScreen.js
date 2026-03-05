import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Alert, Modal
} from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfileStore } from '../store/profileStore';
import { useRaceStore } from '../store/raceStore';
import { useLanguageStore } from '../store/languageStore';
import { colors, typography, spacing, radius } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { name, getInitials, loadFromStorage, updateProfile } = useProfileStore();
  const { getUpcomingRaces, getPastRaces, getDebrief } = useRaceStore();
  const { language, setLanguage } = useLanguageStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => { loadFromStorage(); }, []);

  const upcoming = getUpcomingRaces();
  const past = getPastRaces();

  const saveName = async () => {
    if (nameInput.trim()) await updateProfile({ name: nameInput.trim() });
    setEditingName(false);
  };

  const handleSetLanguage = async (lang) => {
    await setLanguage(lang);
    setLangModalVisible(false);
  };

  const DISTANCE_LABELS = {
    S: t('distances.S'), M: t('distances.M'),
    L: t('distances.L'), XL: t('distances.XL'),
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Profil */}
      <View style={styles.profileBlock}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{getInitials()}</Text>
        </View>
        <View style={styles.profileInfo}>
          {editingName ? (
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              onBlur={saveName}
              onSubmitEditing={saveName}
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => { setNameInput(name); setEditingName(true); }}>
              <Text style={styles.profileName}>{name}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.profileHint}>
            {t('profile.tap_to_edit', { defaultValue: 'Appuyez pour modifier' })}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: colors.primary }]}>{upcoming.length}</Text>
          <Text style={styles.statLabel}>{t('profile.stats_upcoming')}</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={[styles.statNum, { color: colors.bike }]}>{past.length}</Text>
          <Text style={styles.statLabel}>{t('profile.stats_done')}</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Text style={[styles.statNum, { color: colors.run }]}>
            {upcoming.length + past.length}
          </Text>
          <Text style={styles.statLabel}>{t('profile.stats_total', { defaultValue: 'Total' })}</Text>
        </View>
      </View>

      {/* ── Historique ── */}
      <Text style={styles.sectionLabel}>{t('profile.history_title')}</Text>

      {past.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🏅</Text>
          <Text style={styles.emptyTitle}>{t('profile.no_history_title')}</Text>
          <Text style={styles.emptySub}>{t('profile.no_history_sub')}</Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {past.map((race, index) => {
            const debrief = getDebrief(race.id);
            return (
              <TouchableOpacity
                key={race.id}
                style={[
                  styles.historyItem,
                  index < past.length - 1 && styles.historyItemBorder,
                ]}
                onPress={() => navigation.navigate('RaceDetail', { raceId: race.id })}
                activeOpacity={0.7}
              >
                <View style={styles.historyLeft}>
                  <Text style={styles.historyName}>{race.name}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(race.date).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : 'en-GB',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </Text>
                  <View style={styles.historyMeta}>
                    <View style={styles.distPill}>
                      <Text style={styles.distPillText}>
                        {DISTANCE_LABELS[race.distance] || race.distance}
                      </Text>
                    </View>
                    {debrief && (
                      <Text style={styles.historyStars}>
                        {'★'.repeat(debrief.globalFeeling)}{'☆'.repeat(5 - debrief.globalFeeling)}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.historyRight}>
                  {debrief ? (
                    <Text style={styles.historyTime}>{debrief.totalTime}</Text>
                  ) : (
                    <View style={styles.noDebriefBadge}>
                      <Text style={styles.noDebriefText}>{t('profile.debrief_missing')}</Text>
                    </View>
                  )}
                  <Text style={styles.historyArrow}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ── Paramètres ── */}
      <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
        {t('profile.settings')}
      </Text>

      <View style={styles.menuList}>

        {/* Langue */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setLangModalVisible(true)}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.surface2 }]}>
            <Text>{language === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{t('profile.language_title')}</Text>
            <Text style={styles.menuSub}>
              {language === 'fr' ? t('language.french') : t('language.english')}
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* À propos */}
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={() => Alert.alert('Swim Bike Run', t('profile.about_msg'))}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.surface2 }]}>
            <Text>ℹ️</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{t('profile.about_title')}</Text>
            <Text style={styles.menuSub}>{t('profile.about_sub')}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Modal langue */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('language.title')}</Text>

            <TouchableOpacity
              style={[styles.langOption, language === 'fr' && styles.langOptionActive]}
              onPress={() => handleSetLanguage('fr')}
            >
              <Text style={styles.langFlag}>🇫🇷</Text>
              <Text style={[styles.langOptionText, language === 'fr' && { color: colors.primary }]}>
                {t('language.french')}
              </Text>
              {language === 'fr' && <Text style={styles.langCheck}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langOption, language === 'en' && styles.langOptionActive]}
              onPress={() => handleSetLanguage('en')}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langOptionText, language === 'en' && { color: colors.primary }]}>
                {t('language.english')}
              </Text>
              {language === 'en' && <Text style={styles.langCheck}>✓</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },

  profileBlock: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  profileAvatarText: { color: colors.bg, fontWeight: '900', fontSize: 22 },
  profileInfo: { flex: 1 },
  profileName: { ...typography.h3, fontSize: 22, marginBottom: 2 },
  profileHint: { fontSize: 11, color: colors.textDim },
  nameInput: {
    ...typography.h3, fontSize: 22, color: colors.textPrimary,
    borderBottomWidth: 1, borderBottomColor: colors.primary, paddingBottom: 2,
  },

  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg, overflow: 'hidden',
  },
  statItem: { flex: 1, padding: spacing.md, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: colors.border },
  statNum: { fontSize: 26, fontWeight: '900', letterSpacing: -1 },
  statLabel: { ...typography.caption, fontSize: 11, marginTop: 2, textAlign: 'center' },

  sectionLabel: { ...typography.label, marginBottom: spacing.sm },

  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.xl, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyTitle: { ...typography.h3, fontSize: 16, marginBottom: spacing.xs },
  emptySub: { ...typography.caption, textAlign: 'center' },

  historyList: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  historyItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  historyLeft: { flex: 1 },
  historyName: { ...typography.body, fontWeight: '700', marginBottom: 2 },
  historyDate: { ...typography.caption, fontSize: 12, marginBottom: spacing.sm },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  distPill: {
    backgroundColor: colors.surface2, borderRadius: radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  distPillText: { color: colors.textSecondary, fontWeight: '700', fontSize: 10 },
  historyStars: { fontSize: 12, color: colors.primary },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyTime: { fontSize: 20, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },
  noDebriefBadge: {
    backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  noDebriefText: { fontSize: 10, color: colors.textSecondary },
  historyArrow: { color: colors.textDim, fontSize: 16 },

  menuList: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  menuInfo: { flex: 1 },
  menuTitle: { ...typography.body, fontWeight: '600', fontSize: 14 },
  menuSub: { ...typography.caption, fontSize: 12, marginTop: 1 },
  menuArrow: { color: colors.textDim, fontSize: 18 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: spacing.lg, width: 280,
    borderWidth: 1, borderColor: colors.border,
  },
  modalTitle: { ...typography.label, textAlign: 'center', marginBottom: spacing.md, color: colors.textSecondary },
  langOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: 'transparent', marginBottom: spacing.sm,
  },
  langOptionActive: { borderColor: `${colors.primary}40`, backgroundColor: `${colors.primary}10` },
  langFlag: { fontSize: 28 },
  langOptionText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  langCheck: { color: colors.primary, fontSize: 16, fontWeight: '800' },
});
