import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const useLanguageStore = create((set) => ({
  language: 'en',

  setLanguage: async (lang) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('language', lang);
    set({ language: lang });
  },

  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem('language');
    if (saved) {
      await i18n.changeLanguage(saved);
      set({ language: saved });
    }
  },
}));
