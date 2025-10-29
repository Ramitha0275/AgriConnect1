import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa', 'or'];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(localStorage.getItem('agriconnect-lang') || 'en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`./translations/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load translations for language: ${language}`);
        }
        const data = await response.json();
        const englishResponse = await fetch('./translations/en.json');
        const englishData = await englishResponse.json();
        
        setTranslations({
            current: data,
            fallback: englishData
        });
        setIsReady(true);
      } catch (error) {
        console.error(error);
        // Load fallback if current language fails
        const englishResponse = await fetch('./translations/en.json');
        const englishData = await englishResponse.json();
        setTranslations({ current: englishData, fallback: englishData });
        setIsReady(true);
      }
    };
    loadTranslations();
  }, [language]);
  
  const setLanguage = (lang: string) => {
    if (supportedLanguages.includes(lang)) {
      setIsReady(false);
      localStorage.setItem('agriconnect-lang', lang);
      setLanguageState(lang);
    }
  };

  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    if (!isReady) return key;

    const keyParts = key.split('.');
    
    let translation = keyParts.reduce((obj, part) => obj && obj[part], translations.current);

    if (typeof translation !== 'string' || translation === '') {
        translation = keyParts.reduce((obj, part) => obj && obj[part], translations.fallback);
    }

    if (typeof translation !== 'string') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isReady }}>
      {isReady ? children : <div>Loading translations...</div>}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};