import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Try to load from localStorage, default to 'en'
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem('elder_lang') || 'en';
  });

  const SPEECH_LANG_MAP = {
    en: 'en-IN',
    ta: 'ta-IN',
    hi: 'hi-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    gu: 'gu-IN'
  };

  const applyGoogleTranslate = (code) => {
    if (typeof window === 'undefined') return;
    try {
      const cookieVal = code === 'en' ? '' : `/en/${code}`;
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `googtrans=${cookieVal}; expires=${expires}; path=/`;
      document.cookie = `googtrans=${cookieVal}; expires=${expires}; domain=${window.location.hostname}; path=/`;

      // Trigger translate dropdown if available
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Translate trigger notice:', e);
    }
  };

  // Whenever lang changes, update localStorage, HTML root attribute, and trigger universal translation
  useEffect(() => {
    localStorage.setItem('elder_lang', langCode);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-lang', langCode);
      applyGoogleTranslate(langCode);
    }
  }, [langCode]);

  // Helper function to get translation with fallback
  // e.g. t('nav.dashboard', 'Dashboard')
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    
    // First try active language
    let current = translations[langCode];
    let found = true;
    if (current) {
      for (const key of keys) {
        if (current[key] === undefined) {
          found = false;
          break;
        }
        current = current[key];
      }
    } else {
      found = false;
    }

    if (found && current !== undefined) {
      return current;
    }

    // Fallback to English
    current = translations['en'];
    if (current) {
      for (const fallbackKey of keys) {
        if (current[fallbackKey] === undefined) {
          return fallback || path;
        }
        current = current[fallbackKey];
      }
      return current !== undefined ? current : (fallback || path);
    }

    return fallback || path;
  };

  const activeLanguage = languages.find(l => l.code === langCode) || languages[0];
  const speechLangCode = SPEECH_LANG_MAP[langCode] || 'en-IN';

  return (
    <LanguageContext.Provider value={{ langCode, setLangCode, t, languages, activeLanguage, speechLangCode, applyGoogleTranslate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
