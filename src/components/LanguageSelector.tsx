import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TranslateIcon } from './icons/Icons';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="relative flex items-center">
        <TranslateIcon className="w-5 h-5 absolute left-3 text-text-secondary pointer-events-none" />
        <select
            value={language}
            onChange={handleLanguageChange}
            className="appearance-none bg-white/50 hover:bg-white/80 transition-colors pl-10 pr-4 py-2 rounded-md text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Select language"
        >
            {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
                {lang.name}
            </option>
            ))}
      </select>
    </div>
  );
};

export default LanguageSelector;