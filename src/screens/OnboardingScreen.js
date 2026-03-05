import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '../store/onboardingStore';
import { useProfileStore } from '../store/profileStore';
import { useLanguageStore } from '../store/languageStore';
import { colors, spacing, radius } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const TOTAL_SLIDES = 3;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const scrollRef = useRef(null);

  const { completeOnboarding } = useOnboardingStore();
  const { updateProfile } = useProfileStore();
  const { language, setLanguage } = useLanguageStore();
  
  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentSlide(index);
  };

  const handleLanguageSelect = async (lang) => {
    await setLanguage(lang);
    goToSlide(1);
  };

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1);
  };

  const handleComplete = async () => {
    const finalName = name.trim() || 'Athlete';
    await completeOnboarding({ name: finalName, email: email.trim() });
    await updateProfile({ name: finalName });
  };

  return (
    <View style={styles.container}>
      {/* Progress bars */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <View key={i} style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: i < currentSlide ? '100%' : i === currentSlide ? '60%' : '0%' }
            ]} />
          </View>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SLIDE 1 : Langue ── */}
        <View style={[styles.slide, { width }]}>
          <View style={styles.slideGlow} />
          <View style={styles.slideGlow2} />

          <View style={styles.slide1Content}>
            <View style={styles.orbsRow}>
              <View style={[styles.orb, { backgroundColor: `${colors.swim}15` }]}>
                <Text style={styles.orbEmoji}>🏊</Text>
              </View>
              <View style={[styles.orb, { backgroundColor: `${colors.bike}15` }]}>
                <Text style={styles.orbEmoji}>🚴</Text>
              </View>
              <View style={[styles.orb, { backgroundColor: `${colors.run}15` }]}>
                <Text style={styles.orbEmoji}>🏃</Text>
              </View>
            </View>

            <Text style={styles.mainTitle}>
              SWIM{'\n'}BIKE{'\n'}
              <Text style={{ color: colors.primary }}>RUN</Text>
            </Text>

            <Text style={styles.mainSub}>{t('onboarding.tagline')}</Text>

            <Text style={styles.chooseLanguage}>{t('onboarding.choose_language')}</Text>
          </View>

          {/* Language pickers */}
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'fr' && styles.langBtnActive]}
              onPress={() => handleLanguageSelect('fr')}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>🇫🇷</Text>
              <Text style={[styles.langLabel, language === 'fr' && styles.langLabelActive]}>
                Français
              </Text>
              {language === 'fr' && <View style={styles.langCheckDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => handleLanguageSelect('en')}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>🇬🇧</Text>
              <Text style={[styles.langLabel, language === 'en' && styles.langLabelActive]}>
                English
              </Text>
              {language === 'en' && <View style={styles.langCheckDot} />}
            </TouchableOpacity>
          </View>

          <View style={{ height: 48 }} />
        </View>

        {/* ── SLIDE 2 : Profil ── */}
        <KeyboardAvoidingView
          style={{ width }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.slide2Content}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
          >
            <View style={styles.slide2Top}>
              <Text style={styles.stepTag}>{t('onboarding.step1of2')}</Text>
              <Text style={styles.slideQuestion}>{t('onboarding.tell_us')}</Text>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('onboarding.first_name')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('onboarding.first_name')}
                  placeholderTextColor={colors.textDim}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t('onboarding.email')}</Text>
                  <View style={styles.optionalTag}>
                    <Text style={styles.optionalTagText}>{t('onboarding.optional')}</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, styles.inputInactive]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textDim}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                />
                <Text style={styles.fieldHint}>{t('onboarding.email_hint')}</Text>
              </View>

              <View style={styles.localBadge}>
                <Text style={styles.localBadgeIcon}>🔒</Text>
                <Text style={styles.localBadgeText}>{t('onboarding.local_storage')}</Text>
              </View>
            </View>

            <View style={styles.slideBottom}>
              <TouchableOpacity style={styles.ctaBtn} onPress={handleNext} activeOpacity={0.85}>
                <Text style={styles.ctaBtnText}>{t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── SLIDE 3 : Features ── */}
        <View style={[styles.slide, { width }]}>
          <View style={styles.slide3Content}>
            <Text style={styles.stepTag}>{t('onboarding.step2of2')}</Text>
            <Text style={styles.slideQuestion}>{t('onboarding.what_you_need')}</Text>

            <View style={styles.featureList}>
              <View style={[styles.featureCard, styles.featureSwim]}>
                <View style={[styles.featureIcon, { backgroundColor: `${colors.swim}12` }]}>
                  <Text style={styles.featureEmoji}>✅</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{t('onboarding.feature_checklist_title')}</Text>
                  <Text style={styles.featureSub}>{t('onboarding.feature_checklist_sub')}</Text>
                </View>
              </View>

              <View style={[styles.featureCard, styles.featureBike]}>
                <View style={[styles.featureIcon, { backgroundColor: `${colors.bike}12` }]}>
                  <Text style={styles.featureEmoji}>🔔</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{t('onboarding.feature_reminders_title')}</Text>
                  <Text style={styles.featureSub}>{t('onboarding.feature_reminders_sub')}</Text>
                </View>
              </View>

              <View style={[styles.featureCard, styles.featureRun]}>
                <View style={[styles.featureIcon, { backgroundColor: `${colors.run}12` }]}>
                  <Text style={styles.featureEmoji}>📊</Text>
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{t('onboarding.feature_debrief_title')}</Text>
                  <Text style={styles.featureSub}>{t('onboarding.feature_debrief_sub')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.slideBottom}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.run }]}
              onPress={handleComplete}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaBtnText, { color: '#000' }]}>
                {t('onboarding.add_first_race')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 56 },

  progressRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 20, marginBottom: 8 },
  progressBar: {
    flex: 1, height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 1 },

  slide: { flex: 1, justifyContent: 'space-between', paddingBottom: 48, overflow: 'hidden' },
  slideBottom: { paddingHorizontal: 22 },

  ctaBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center' },
  ctaBtnText: { fontWeight: '900', fontSize: 18, color: colors.bg, letterSpacing: 0.3 },

  // Slide 1
  slideGlow: {
    position: 'absolute', top: -80, left: -80,
    width: 400, height: 400,
    backgroundColor: 'transparent', borderRadius: 200,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 120,
  },
  slideGlow2: {
    position: 'absolute', bottom: -80, right: -60,
    width: 300, height: 300,
    backgroundColor: 'transparent', borderRadius: 150,
    shadowColor: colors.run, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 100,
  },
  slide1Content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36,
  },
  orbsRow: { flexDirection: 'row', gap: 10, marginBottom: 36 },
  orb: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  orbEmoji: { fontSize: 30 },
  mainTitle: {
    fontWeight: '900', fontSize: 64, color: colors.textPrimary,
    letterSpacing: -2.5, lineHeight: 60, textAlign: 'center', marginBottom: 20,
  },
  mainSub: {
    fontSize: 15, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22, maxWidth: 240, marginBottom: 32,
  },
  chooseLanguage: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', color: colors.textSecondary, marginBottom: 0,
  },

  // Language buttons
  langRow: { flexDirection: 'row', paddingHorizontal: 22, gap: 12 },
  langBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 8,
    position: 'relative',
  },
  langBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  langFlag: { fontSize: 40 },
  langLabel: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  langLabelActive: { color: colors.primary },
  langCheckDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // Slide 2
  slide2Content: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: 48 },
  slide2Top: { paddingHorizontal: 22, paddingTop: 20 },
  stepTag: {
    fontSize: 11, fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase', color: colors.primary, marginBottom: 10,
  },
  slideQuestion: {
    fontWeight: '900', fontSize: 40, color: colors.textPrimary,
    letterSpacing: -1, lineHeight: 42, marginBottom: 28,
  },
  fieldBlock: { marginBottom: 16 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.textSecondary,
  },
  optionalTag: {
    backgroundColor: colors.surface2, borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.border,
  },
  optionalTagText: { fontSize: 9, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontWeight: '600', color: colors.textPrimary,
  },
  inputInactive: { borderColor: colors.border, fontSize: 15, fontWeight: '400' },
  fieldHint: { fontSize: 12, color: colors.textDim, marginTop: 6, paddingLeft: 2 },
  localBadge: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: 4,
  },
  localBadgeIcon: { fontSize: 16, marginTop: 1 },
  localBadgeText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  // Slide 3
  slide3Content: { flex: 1, paddingHorizontal: 22, paddingTop: 20 },
  featureList: { gap: 10, marginTop: 4 },
  featureCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderLeftWidth: 3, overflow: 'hidden',
  },
  featureSwim: { borderColor: `${colors.swim}30`, borderLeftColor: colors.swim },
  featureBike: { borderColor: `${colors.bike}25`, borderLeftColor: colors.bike },
  featureRun:  { borderColor: `${colors.run}25`,  borderLeftColor: colors.run  },
  featureIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureEmoji: { fontSize: 22 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 3 },
  featureSub: { fontSize: 12, color: colors.textSecondary },
});
