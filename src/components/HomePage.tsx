import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface HomePageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick, onSignUpClick }) => {
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center p-4 text-white"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1974&auto=format&fit=crop')" }}
    >
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center">
        <img className="h-20 w-auto mx-auto mb-4" src="https://img.icons8.com/color/96/000000/leaf.png" alt="AgriConnect Logo" />
        <h1 className="text-5xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          {t('home.title')}
        </h1>
        <p className="text-xl text-slate-200 mt-4 max-w-2xl mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
          {t('home.subtitle')}
        </p>
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-10">
        <button
          onClick={onLoginClick}
          className="bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-primary-focus transition-transform transform hover:scale-105"
        >
          {t('home.loginBtn')}
        </button>
        <button
          onClick={onSignUpClick}
          className="bg-secondary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-yellow-800 transition-transform transform hover:scale-105"
        >
          {t('home.signupBtn')}
        </button>
      </div>
    </div>
  );
};

export default HomePage;