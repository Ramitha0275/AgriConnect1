import React, { useState } from 'react';
import { AppView } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import { MenuIcon, XIcon, ShoppingCartIcon, LibraryIcon, BriefcaseIcon, ClipboardListIcon, UsersIcon } from './icons/Icons';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { view: AppView.Marketplace, icon: <ShoppingCartIcon className="w-5 h-5" />, label: t('nav.marketplace') },
    { view: AppView.InfoHub, icon: <LibraryIcon className="w-5 h-5" />, label: t('nav.infoHub') },
    { view: AppView.B2B, icon: <BriefcaseIcon className="w-5 h-5" />, label: t('nav.b2b') },
    { view: AppView.FarmManager, icon: <ClipboardListIcon className="w-5 h-5" />, label: t('nav.farmManager') },
    { view: AppView.Community, icon: <UsersIcon className="w-5 h-5" />, label: t('nav.community') },
  ];

  interface NavButtonProps {
      item: { view: AppView; icon: React.ReactElement, label: string };
      isActive: boolean;
      onClick: () => void;
  }
  
  const NavButton: React.FC<NavButtonProps> = ({ item, isActive, onClick }) => (
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-white shadow-md'
            : 'text-text-primary hover:bg-white/50'
        }`}
      >
        {item.icon}
        <span className="hidden md:inline">{item.label}</span>
      </button>
    );

  return (
    <header className="bg-white/30 backdrop-blur-lg shadow-md sticky top-0 z-50 ring-1 ring-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <img className="h-8 w-auto" src="https://img.icons8.com/color/48/000000/leaf.png" alt="AgriConnect Logo" />
              <span className="font-bold text-xl text-primary">AgriConnect</span>
            </div>
            <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                    <NavButton
                        key={item.view}
                        item={item}
                        isActive={currentView === item.view}
                        onClick={() => setCurrentView(item.view)}
                    />
                ))}
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
                <LanguageSelector />
                {user && <span className="text-sm text-text-primary font-medium">{t('common.welcome')}, {user.name}!</span>}
                <button
                    onClick={logout}
                    className="bg-secondary text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-800 transition-colors"
                >
                    {t('common.logout')}
                </button>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-text-primary hover:text-white hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/50 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
                <button
                    key={item.view}
                    onClick={() => {
                        setCurrentView(item.view);
                        setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        currentView === item.view
                        ? 'bg-primary text-white'
                        : 'text-text-primary hover:bg-base-200'
                    }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
            <div className="border-t border-base-200 pt-4 mt-4 px-2 space-y-3">
                 <LanguageSelector />
                 {user && <span className="block text-base font-medium text-text-primary">{t('common.welcome')}, {user.name}!</span>}
                <button
                    onClick={logout}
                    className="w-full text-left bg-secondary text-white px-3 py-2 rounded-md text-base font-medium hover:bg-yellow-800 transition-colors"
                >
                    {t('common.logout')}
                </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;