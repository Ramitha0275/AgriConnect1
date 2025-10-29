import React, { useState, useEffect } from 'react';
import { MarketInfo } from '../types';
import { findMarkets } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { PhoneIcon, LocationMarkerIcon, CurrencyRupeeIcon, SearchIcon, MapIcon } from './icons/Icons';

type SearchMode = 'nearby' | 'search';

const DirectSales: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState<MarketInfo[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('nearby');

  useEffect(() => {
    if (!navigator.geolocation) {
        setLocationStatus('error');
        setLocationErrorMsg('Geolocation is not supported by your browser.');
        return;
    }

    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lon: longitude });
            setLocationStatus('success');
        },
        () => {
            setLocationStatus('error');
            setLocationErrorMsg(t('marketplace.locationError'));
        }
    );
  }, [t]);
  
  const executeSearch = async (query: string, loc?: { lat: number; lon: number }) => {
    setIsSearching(true);
    setSearchError('');
    setMarkets([]);

    try {
      const results = await findMarkets(query, language, loc);
      setMarkets(results);
    } catch (error) {
      console.error(error);
      setSearchError(t('marketplace.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleTextSearch = () => {
    if (!searchTerm.trim()) return;
    executeSearch(searchTerm);
  };

  const handleNearbySearch = () => {
    if (location) {
      executeSearch("agricultural markets near me", location);
    } else {
      setSearchError(locationErrorMsg || "Cannot search without your location. Please grant permission and try again.");
    }
  };

  const LocationStatusBanner = () => {
    if (searchMode !== 'nearby') return null;
    if (locationStatus === 'loading') {
      return (
        <div className="p-3 mb-4 text-center text-sm bg-blue-900/50 backdrop-blur-sm text-blue-100 rounded-lg shadow">
          {t('marketplace.getLocation')}
        </div>
      );
    }
    if (locationStatus === 'error') {
       return (
        <div className="p-3 mb-4 text-center text-sm bg-red-900/50 backdrop-blur-sm text-red-100 rounded-lg shadow">
          {locationErrorMsg}
        </div>
      );
    }
    return null;
  }

  const TabButton = ({ mode, label }: { mode: SearchMode, label: string }) => (
    <button
      onClick={() => setSearchMode(mode)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
        searchMode === mode
          ? 'bg-primary text-white shadow'
          : 'bg-white/30 text-text-primary hover:bg-white/60'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in text-white">
      <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{t('marketplace.title')}</h1>
      <p className="text-slate-200 mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{t('marketplace.subtitle')}</p>

      <div className="flex border-b border-white/20 mb-6">
        <TabButton mode="nearby" label={t('marketplace.nearbyTab')} />
        <TabButton mode="search" label={t('marketplace.searchTab')} />
      </div>

      <div className="bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-lg">
        {searchMode === 'nearby' && (
          <div className="text-center">
              <LocationStatusBanner />
              <button
                  onClick={handleNearbySearch}
                  disabled={isSearching || locationStatus !== 'success'}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-primary-focus transition-all transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
                  <LocationMarkerIcon className="w-5 h-5" />
                  <span>{isSearching ? t('common.searching') : t('marketplace.findNearbyBtn')}</span>
              </button>
          </div>
        )}

        {searchMode === 'search' && (
          <div className="flex gap-2">
              <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
              placeholder={t('marketplace.searchPlaceholder')}
              className="w-full px-4 py-3 border border-white/30 bg-white/20 text-white placeholder-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
              onClick={handleTextSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="bg-primary text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-focus transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
              <SearchIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{isSearching ? t('common.searching') : t('common.search')}</span>
              </button>
          </div>
        )}
      </div>


       {isSearching && (
         <div className="text-center py-12">
            <svg className="animate-spin mx-auto h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-slate-200">{t('marketplace.searchWeb')}</p>
        </div>
      )}

      {searchError && (
        <div className="p-4 my-4 text-center text-sm bg-red-900/60 backdrop-blur-sm text-red-100 rounded-lg shadow">
          {searchError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {markets.map(market => (
          <div key={market.id} className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300 text-text-primary">
            <div className="p-5">
              <h3 className="font-bold text-xl text-text-primary mb-2">{market.name}</h3>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <LocationMarkerIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{market.address}, {market.city}, {market.state}</span>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-text-primary mb-2">{t('marketplace.pricePerQuintal')}</h4>
                <ul className="space-y-1 text-sm">
                  {market.crops.map((crop, index) => (
                    <li key={`${crop.name}-${index}`} className="flex justify-between items-center bg-white/50 p-2 rounded-md">
                      <span className="text-text-secondary">{crop.name}</span>
                      <span className="font-bold text-primary flex items-center">
                        <CurrencyRupeeIcon className="w-4 h-4 mr-1"/>{crop.price.toLocaleString('en-IN')}
                      </span>
                    </li>
                  ))}
                  {market.crops.length === 0 && <li className="text-text-secondary text-xs">{t('marketplace.noPrices')}</li>}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-slate-300/50 mt-auto">
                <a href={`tel:${market.phone}`} className={`bg-white/70 p-3 font-semibold text-primary flex items-center justify-center gap-2 hover:bg-white/90 transition-colors ${!market.phone ? 'pointer-events-none opacity-50' : ''}`}>
                    <PhoneIcon className="w-5 h-5" />
                    <span>{t('marketplace.callNow')}</span>
                </a>
                <a href={market.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${market.latitude},${market.longitude}`} target="_blank" rel="noopener noreferrer" className={`bg-white/70 p-3 font-semibold text-primary flex items-center justify-center gap-2 hover:bg-white/90 transition-colors ${!market.googleMapsUrl && !market.latitude ? 'pointer-events-none opacity-50' : ''}`}>
                    <MapIcon className="w-5 h-5" />
                    <span>{t('marketplace.directions')}</span>
                </a>
            </div>
          </div>
        ))}
      </div>
       {!isSearching && markets.length === 0 && !searchError && (
          <div className="text-center py-12 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl ring-1 ring-black/5 mt-6">
              <h3 className="text-xl font-semibold text-text-primary">{t('marketplace.readyTitle')}</h3>
              <p className="text-text-secondary mt-2">{t('marketplace.readySubtitle')}</p>
          </div>
        )}
    </div>
  );
};

export default DirectSales;