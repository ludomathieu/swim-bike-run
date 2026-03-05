import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr.json';
import en from './en.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: { fr: { translation: fr }, en: { translation: en } },
    lng: 'en', // langue par défaut
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
