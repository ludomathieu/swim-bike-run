import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOnboardingStore = create((set, get) => ({
  hasSeenOnboarding: false,
  name: '',
  email: '',

  completeOnboarding: async ({ name, email }) => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    await AsyncStorage.setItem('onboarding_name', name || '');
    await AsyncStorage.setItem('onboarding_email', email || '');
    set({ hasSeenOnboarding: true, name, email });
  },

  checkOnboarding: async () => {
    const done = await AsyncStorage.getItem('onboarding_done');
    const name = await AsyncStorage.getItem('onboarding_name');
    const email = await AsyncStorage.getItem('onboarding_email');
    if (done === 'true') {
      set({ hasSeenOnboarding: true, name: name || '', email: email || '' });
    }
  },

  // Pour dev : reset l'onboarding
  resetOnboarding: async () => {
    await AsyncStorage.multiRemove(['onboarding_done', 'onboarding_name', 'onboarding_email']);
    set({ hasSeenOnboarding: false, name: '', email: '' });
  },
}));
