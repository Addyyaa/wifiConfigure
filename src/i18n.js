import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translations } from './translations'; // Import translations

i18n
  .use(LanguageDetector) // Use language detector
  .use(initReactI18next)
  .init({
    resources: translations, // Restore the resources
    debug: true,
    fallbackLng: 'en', // Use 'en' if detected language is not available
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 