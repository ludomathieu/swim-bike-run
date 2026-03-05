import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';
import { useTranslation } from 'react-i18next';
import { useRaceStore } from '../store/raceStore';
import { colors, typography, spacing, radius } from '../constants/theme';

const TEMPLATES = [
  { id: 'r1', icon: '🔧', label_fr: 'Réviser le vélo',                    label_en: 'Service the bike',                  days: 30, time: '09:00', color: colors.bike },
  { id: 'r2', icon: '🏨', label_fr: 'Réserver hébergement et transport',  label_en: 'Book accommodation & transport',    days: 30, time: '10:00', color: colors.bike },
  { id: 'r3', icon: '🎒', label_fr: 'Commencer à préparer le sac',        label_en: 'Start preparing the bag',           days: 7,  time: '19:00', color: colors.swim },
  { id: 'r4', icon: '✅', label_fr: 'Vérifier la checklist',              label_en: 'Check the gear checklist',          days: 7,  time: '18:00', color: colors.run  },
  { id: 'r5', icon: '📋', label_fr: 'Lire le règlement de la course',     label_en: 'Read the race regulations',         days: 7,  time: '20:00', color: colors.primary },
];

async function getOrCreateCalendar() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') return null;

  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return defaultCal?.id || null;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const editable = calendars.find(c => c.allowsModifications);
  return editable?.id || null;
}

async function addToCalendar(calendarId, title, triggerDate, notes) {
  const startDate = new Date(triggerDate);
  const endDate = new Date(triggerDate);
  endDate.setMinutes(endDate.getMinutes() + 60);
  return await Calendar.createEventAsync(calendarId, {
    title: `🏊🚴🏃 ${title}`,
    startDate, endDate, notes,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{ relativeOffset: -30 }],
  });
}

export default function RemindersScreen({ route }) {
  const { raceId } = route.params;
  const { t, i18n } = useTranslation();
  const { getRace, addReminder, clearReminders } = useRaceStore();
  const race = getRace(raceId);

  const [calendarEnabled, setCalendarEnabled] = useState(false);
  const [calendarId, setCalendarId] = useState(null);

  useEffect(() => { checkCalendarPermission(); }, []);

  const checkCalendarPermission = async () => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status === 'granted') {
      setCalendarEnabled(true);
      const id = await getOrCreateCalendar();
      setCalendarId(id);
    }
  };

  const enableCalendar = async () => {
    const id = await getOrCreateCalendar();
    if (id) {
      setCalendarId(id);
      setCalendarEnabled(true);
      Alert.alert(t('reminders.calendar_enabled_title'), t('reminders.calendar_enabled_msg'));
    } else {
      Alert.alert(t('reminders.permission_denied'), t('reminders.permission_denied_msg'));
    }
  };

  if (!race) return null;

  const scheduled = race.reminders || [];
  const raceDate = new Date(race.date);
  const lang = i18n.language;

  const getLabel = (template) => lang === 'fr' ? template.label_fr : template.label_en;

  const getDayLabel = (days) => {
    if (days === 0) return lang === 'fr' ? 'Matin de course' : 'Race morning';
    return `J-${days}`;
  };

  const scheduleReminder = async (template) => {
    try {
      const trigger = new Date(raceDate);
      const [h, m] = template.time.split(':').map(Number);
      trigger.setDate(trigger.getDate() - template.days);
      trigger.setHours(h, m, 0, 0);

      if (trigger <= new Date()) {
        Alert.alert(t('reminders.past_date'), t('reminders.past_date_msg'));
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return;
      }

      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏊🚴🏃 Swim Bike Run',
          body: `${race.name} — ${getLabel(template)}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: trigger,
        },
      });

      let calEventId = null;
      if (calendarEnabled && calendarId) {
        try {
          calEventId = await addToCalendar(
            calendarId,
            `${getLabel(template)} — ${race.name}`,
            trigger,
            race.name
          );
        } catch (e) { console.log('Erreur calendrier:', e); }
      }

      await addReminder(raceId, {
        ...template,
        notifId, calEventId,
        triggerDate: trigger.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB'),
        triggerISO: trigger.toISOString(),
      });

      Alert.alert(
        t('reminders.created_title'),
        `📲 ${lang === 'fr' ? 'Notification programmée' : 'Notification scheduled'}${calendarEnabled ? `\n📅 ${lang === 'fr' ? 'Ajouté au calendrier' : 'Added to calendar'}` : ''}\n${trigger.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB')} · ${template.time}`
      );
    } catch (e) {
      Alert.alert('Erreur', e.message || 'Une erreur est survenue.');
    }
  };

  const handleClearAll = () => {
    Alert.alert(t('reminders.cancel_confirm_title'), t('reminders.cancel_confirm_msg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'), style: 'destructive', onPress: async () => {
          await Notifications.cancelAllScheduledNotificationsAsync();
          if (calendarEnabled) {
            for (const r of scheduled) {
              if (r.calEventId) {
                try { await Calendar.deleteEventAsync(r.calEventId); } catch (e) {}
              }
            }
          }
          await clearReminders(raceId);
        }
      },
    ]);
  };

  const isScheduled = (id) => scheduled.some(s => s.id === id);

  // Grouper les templates par période
  const grouped = [
    { period: 'J-30', items: TEMPLATES.filter(t => t.days === 30) },
    { period: 'J-7',  items: TEMPLATES.filter(t => t.days === 7) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Race info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>{t('reminders.race_label')}</Text>
        <Text style={styles.infoName}>{race.name}</Text>
        <Text style={styles.infoDate}>
          📅 {raceDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </Text>
      </View>

      {/* Calendrier toggle */}
      <TouchableOpacity
        style={[styles.calendarToggle, calendarEnabled && styles.calendarToggleActive]}
        onPress={calendarEnabled ? null : enableCalendar}
        activeOpacity={calendarEnabled ? 1 : 0.7}
      >
        <View style={styles.calendarToggleLeft}>
          <Text style={styles.calendarToggleIcon}>📅</Text>
          <View>
            <Text style={styles.calendarToggleTitle}>{t('reminders.calendar_title')}</Text>
            <Text style={styles.calendarToggleSub}>
              {calendarEnabled ? t('reminders.calendar_active') : t('reminders.calendar_inactive')}
            </Text>
          </View>
        </View>
        <View style={[styles.toggleDot, calendarEnabled && styles.toggleDotActive]}>
          <Text style={[styles.toggleDotText, calendarEnabled && { color: colors.primary }]}>
            {calendarEnabled ? 'ON' : 'OFF'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Templates groupés */}
      <Text style={styles.sectionLabel}>{t('reminders.auto_reminders')}</Text>

      {grouped.map(group => (
        <View key={group.period} style={styles.groupBlock}>
          <View style={styles.groupHeader}>
            <View style={styles.groupPeriodBadge}>
              <Text style={styles.groupPeriodText}>{group.period}</Text>
            </View>
            <View style={styles.groupLine} />
          </View>

          <View style={styles.templatesCard}>
            {group.items.map((template, index) => {
              const done = isScheduled(template.id);
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateItem,
                    index < group.items.length - 1 && styles.templateBorder,
                    done && styles.templateDone,
                  ]}
                  onPress={() => !done && scheduleReminder(template)}
                  activeOpacity={done ? 1 : 0.7}
                >
                  <View style={[styles.templateIconWrap, { backgroundColor: `${template.color}15` }]}>
                    <Text style={{ fontSize: 20 }}>{template.icon}</Text>
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateLabel, done && styles.templateLabelDone]}>
                      {getLabel(template)}
                    </Text>
                    <Text style={styles.templateMeta}>
                      {getDayLabel(template.days)} · {template.time}
                    </Text>
                    {done && (
                      <View style={styles.scheduledBadges}>
                        <View style={styles.microBadge}>
                          <Text style={styles.microBadgeText}>📲 Notif</Text>
                        </View>
                        {scheduled.find(s => s.id === template.id)?.calEventId && (
                          <View style={[styles.microBadge, { borderColor: `${colors.run}40` }]}>
                            <Text style={[styles.microBadgeText, { color: colors.run }]}>📅 Agenda</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={[
                    styles.templateAction,
                    done
                      ? { borderColor: colors.run, backgroundColor: `${colors.run}15` }
                      : { borderColor: `${template.color}50` }
                  ]}>
                    <Text style={[styles.templateActionText, { color: done ? colors.run : template.color }]}>
                      {done ? '✓' : '+'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* Scheduled list */}
      {scheduled.length > 0 && (
        <>
          <View style={styles.scheduledHeader}>
            <Text style={styles.sectionLabel}>
              {t('reminders.scheduled', { count: scheduled.length })}
            </Text>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.cancelAll}>{t('reminders.cancel_all')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scheduledCard}>
            {scheduled.map((s, i) => (
              <View
                key={i}
                style={[styles.scheduledItem, i < scheduled.length - 1 && styles.templateBorder]}
              >
                <Text style={{ fontSize: 18, marginRight: spacing.md }}>{s.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduledLabel}>{getLabel(s)}</Text>
                  <Text style={styles.scheduledDate}>{s.triggerDate} · {s.time}</Text>
                  <View style={styles.scheduledBadges}>
                    <View style={styles.microBadge}>
                      <Text style={styles.microBadgeText}>📲 Notif</Text>
                    </View>
                    {s.calEventId && (
                      <View style={[styles.microBadge, { borderColor: `${colors.run}40` }]}>
                        <Text style={[styles.microBadgeText, { color: colors.run }]}>📅 Agenda</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.onBadge}>
                  <Text style={styles.onBadgeText}>{t('reminders.on')}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },

  infoCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
    borderWidth: 1, borderColor: `${colors.primary}30`,
  },
  infoLabel: { ...typography.label, marginBottom: spacing.xs },
  infoName: { ...typography.h3, marginBottom: spacing.xs },
  infoDate: { ...typography.caption, color: colors.primary },

  calendarToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  calendarToggleActive: { borderColor: `${colors.primary}40` },
  calendarToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  calendarToggleIcon: { fontSize: 24 },
  calendarToggleTitle: { ...typography.body, fontWeight: '600', fontSize: 14 },
  calendarToggleSub: { ...typography.caption, fontSize: 11, marginTop: 1 },
  toggleDot: {
    backgroundColor: colors.surface2, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleDotActive: { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` },
  toggleDotText: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.5 },

  sectionLabel: { ...typography.label, marginBottom: spacing.sm },

  // Groupes
  groupBlock: { marginBottom: spacing.md },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  groupPeriodBadge: {
    backgroundColor: colors.surface2, borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  groupPeriodText: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.5 },
  groupLine: { flex: 1, height: 1, backgroundColor: colors.border },

  templatesCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  templateItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  templateBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  templateDone: { opacity: 0.6 },
  templateIconWrap: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md, flexShrink: 0,
  },
  templateInfo: { flex: 1 },
  templateLabel: { ...typography.body, fontSize: 14, fontWeight: '500' },
  templateLabelDone: { textDecorationLine: 'line-through', color: colors.textDim },
  templateMeta: { ...typography.caption, marginTop: 2 },

  scheduledBadges: { flexDirection: 'row', gap: 6, marginTop: 5 },
  microBadge: {
    borderRadius: 6, borderWidth: 1,
    borderColor: `${colors.primary}40`,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  microBadgeText: { fontSize: 10, fontWeight: '600', color: colors.primary },

  templateAction: {
    width: 32, height: 32, borderRadius: radius.full,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  templateActionText: { fontSize: 18, fontWeight: '700', lineHeight: 22 },

  scheduledHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  cancelAll: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  scheduledCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  scheduledItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  scheduledLabel: { ...typography.body, fontSize: 14, fontWeight: '500' },
  scheduledDate: { ...typography.caption, marginTop: 2 },
  onBadge: {
    backgroundColor: `${colors.run}20`, borderRadius: radius.full,
    borderWidth: 1, borderColor: `${colors.run}50`,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  onBadgeText: { color: colors.run, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});
