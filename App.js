import './src/i18n'; // initialise i18next en premier
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useOnboardingStore } from './src/store/onboardingStore';
import { useLanguageStore } from './src/store/languageStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { hasSeenOnboarding, checkOnboarding } = useOnboardingStore();
  const { loadLanguage } = useLanguageStore();

  useEffect(() => {
    async function init() {
      await loadLanguage();
      await checkOnboarding();
      await registerForPushNotifications();
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) return <View style={{ flex: 1, backgroundColor: '#080810' }} />;

  return (
    <>
      <StatusBar style="light" />
      {hasSeenOnboarding ? <AppNavigator /> : <OnboardingScreen />}
    </>
  );
}

async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') console.log('Permission notifications refusée');
}
