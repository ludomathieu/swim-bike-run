import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/HomeScreen';
import RaceDetailScreen from '../screens/RaceDetailScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import PreRaceChecklistScreen from '../screens/PreRaceChecklistScreen';
import RemindersScreen from '../screens/RemindersScreen';
import DebriefScreen from '../screens/DebriefScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useProfileStore } from '../store/profileStore';
import { colors } from '../constants/theme';

const Stack = createStackNavigator();

function GlobalHeader({ navigation, routeName }) {
  const { t } = useTranslation();
  const { getInitials } = useProfileStore();
  const isHome = routeName === 'Home';

  const titles = {
    Home:             t('nav.home'),
    RaceDetail:       t('nav.race_detail'),
    Checklist:        t('nav.checklist'),
    PreRaceChecklist: t('nav.pre_race'),
    Reminders:        t('nav.reminders'),
    Debrief:          t('nav.debrief'),
    History:          t('nav.history'),
    Profile:          t('nav.profile'),
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={() => isHome ? null : navigation.navigate('Home')}
      >
        <Text style={[styles.headerBtnText, isHome && { opacity: 0.3 }]}>←</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {titles[routeName] || ''}
      </Text>

      <TouchableOpacity
        style={styles.avatarBtn}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.avatarText}>{getInitials()}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          cardStyle: { backgroundColor: colors.bg },
          header: () => (
            <GlobalHeader navigation={navigation} routeName={route.name} />
          ),
        })}
      >
        <Stack.Screen name="Home"             component={HomeScreen} />
        <Stack.Screen name="RaceDetail"       component={RaceDetailScreen} />
        <Stack.Screen name="Checklist"        component={ChecklistScreen} />
        <Stack.Screen name="PreRaceChecklist" component={PreRaceChecklistScreen} />
        <Stack.Screen name="Reminders"        component={RemindersScreen} />
        <Stack.Screen name="Debrief"          component={DebriefScreen} />
        <Stack.Screen name="History"          component={HistoryScreen} />
        <Stack.Screen name="Profile"          component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 52,
  },
  headerBtn: {
    width: 38, height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnText: { fontSize: 18, color: colors.textPrimary },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 15, fontWeight: '700',
    color: colors.textPrimary, paddingHorizontal: 8,
  },
  avatarBtn: {
    width: 38, height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.bg, fontWeight: '900', fontSize: 15 },
});
