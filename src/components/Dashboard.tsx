import React, { useState } from 'react';
import { AppView } from '../types';
import Header from './Header';
import DirectSales from './DirectSales';
import InfoHub from './InfoHub';
import B2BPlatform from './B2BPlatform';
import FarmManagement from './FarmManagement';
import Community from './Community';

const backgroundImages: Record<AppView, string> = {
  [AppView.Marketplace]: "url('https://images.unsplash.com/photo-1579102715467-53c3a4d491a9?q=80&w=1969&auto=format&fit=crop')",
  [AppView.InfoHub]: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')",
  [AppView.B2B]: "url('https://images.unsplash.com/photo-1578500220372-5421a1f0a574?q=80&w=1931&auto=format&fit=crop')",
  [AppView.FarmManager]: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1974&auto=format&fit=crop')",
  [AppView.Community]: "url('https://images.unsplash.com/photo-1580252453534-7c0a370e5446?q=80&w=1932&auto=format&fit=crop')",
};

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Marketplace);

  const renderView = () => {
    switch (currentView) {
      case AppView.Marketplace:
        return <DirectSales />;
      case AppView.InfoHub:
        return <InfoHub />;
      case AppView.B2B:
        return <B2BPlatform />;
      case AppView.FarmManager:
        return <FarmManagement />;
      case AppView.Community:
        return <Community />;
      default:
        return <DirectSales />;
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed transition-all duration-500"
      style={{ backgroundImage: backgroundImages[currentView] }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative min-h-screen flex flex-col">
          <Header currentView={currentView} setCurrentView={setCurrentView} />
          <main className="p-4 md:p-8 flex-grow">
            {renderView()}
          </main>
      </div>
    </div>
  );
};

export default Dashboard;