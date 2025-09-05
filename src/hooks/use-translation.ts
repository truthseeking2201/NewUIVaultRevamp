import { useState, useEffect, useCallback } from 'react';
import { getEnglishText, translateViToEn } from '@/utils/translations';

type Language = 'en' | 'vi';

/**
 * Custom hook for handling translations in the application
 *
 * @returns {Object} Translation utilities and state
 */
export function useTranslation() {
  // Get the language from localStorage or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = typeof window !== 'undefined'
      ? localStorage.getItem('language') as Language
      : null;
    return savedLanguage || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  // Toggle between languages
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'vi' : 'en');
  }, []);

  // Set language explicitly
  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  // Translate text based on the current language
  const translate = useCallback((key: string) => {
    if (language === 'en') {
      return getEnglishText(key);
    }
    // Return the key directly for Vietnamese
    return key;
  }, [language]);

  // Translate any text directly
  const translateText = useCallback((text: string) => {
    if (language === 'en') {
      return translateViToEn(text);
    }
    // Return the original text for Vietnamese
    return text;
  }, [language]);

  return {
    language,
    toggleLanguage,
    changeLanguage,
    translate,
    translateText,
    isEnglish: language === 'en'
  };
}
