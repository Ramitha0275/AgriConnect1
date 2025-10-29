import React, { useState, useCallback } from 'react';
import { generateAgriculturalGuide, getCropRecommendation, getFarmConditionsFromLocation } from '../services/geminiService';
import { SunIcon, TrendingUpIcon, LightBulbIcon, LocationMarkerIcon } from './icons/Icons';
import { CropRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';

const InfoHub: React.FC = () => {
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [guide, setGuide] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [recInputs, setRecInputs] = useState({ state: '', soilType: '', rainfall: '', temperature: '' });
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRecInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleManualRecommendation = async () => {
    const { state, soilType, rainfall, temperature } = recInputs;
    if (!state.trim() || !soilType.trim() || !rainfall.trim() || !temperature.trim()) {
      setSuggestionError(t('infoHub.fillAllFieldsError'));
      return;
    }
    setIsSuggesting(true);
    setSuggestionError('');
    setRecommendations([]);
    setDetectedLocation('');
    try {
      const results = await getCropRecommendation(
        state, soilType, Number(rainfall), Number(temperature), language
      );
      setRecommendations(results);
    } catch (error) {
      setSuggestionError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleLocationRecommendation = async () => {
    setIsSuggesting(true);
    setSuggestionError('');
    setRecommendations([]);
    setRecInputs({ state: '', soilType: '', rainfall: '', temperature: '' });
    setDetectedLocation('');

    if (!navigator.geolocation) {
        setSuggestionError('Geolocation is not supported by your browser.');
        setIsSuggesting(false);
        return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;

      const conditions = await getFarmConditionsFromLocation(latitude, longitude, language);
      
      const locationString = [conditions.city, conditions.district, conditions.state].filter(Boolean).join(', ');
      setDetectedLocation(locationString);

      setRecInputs({
        state: conditions.state,
        soilType: conditions.soilType,
        rainfall: String(conditions.rainfall),
        temperature: String(conditions.temperature),
      });

      const results = await getCropRecommendation(
        conditions.state,
        conditions.soilType,
        conditions.rainfall,
        conditions.temperature,
        language
      );
      setRecommendations(results);

    } catch (error) {
        if (error instanceof GeolocationPositionError) {
            setSuggestionError(`Error getting location: ${error.message}. Please ensure location services are enabled.`);
        } else {
            setSuggestionError(error instanceof Error ? error.message : 'An unknown error occurred during suggestion.');
        }
    } finally {
        setIsSuggesting(false);
    }
  };


  const fetchGuide = useCallback(async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setGuide('');
    try {
      const result = await generateAgriculturalGuide(topic, language);
      setGuide(result);
    } catch (error) {
      setGuide('Failed to fetch guide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, language]);
  
  const isManualRecButtonDisabled = isSuggesting || !recInputs.state.trim() || !recInputs.soilType.trim() || !recInputs.rainfall.trim() || !recInputs.temperature.trim();

  return (
    <div className="animate-fade-in text-white">
      <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{t('infoHub.title')}</h1>
      <p className="text-slate-200 mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{t('infoHub.subtitle')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5 text-text-primary">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><SunIcon className="w-6 h-6 text-yellow-500" /> {t('infoHub.weatherTitle')}</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-4xl font-bold">22°C</p>
              <p className="text-text-secondary">{t('infoHub.weatherDesc')}</p>
            </div>
            <p className="text-6xl">☀️</p>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5 text-text-primary">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUpIcon className="w-6 h-6 text-green-500" /> {t('infoHub.marketPricesTitle')}</h2>
          <ul className="space-y-2">
            <li className="flex justify-between"><span>{t('infoHub.corn')}</span><span className="font-semibold text-green-600">₹1,800 ▲</span></li>
            <li className="flex justify-between"><span>{t('infoHub.soybeans')}</span><span className="font-semibold text-red-600">₹4,500 ▼</span></li>
            <li className="flex justify-between"><span>{t('infoHub.wheat')}</span><span className="font-semibold text-green-600">₹2,200 ▲</span></li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5 mb-8 text-text-primary">
        <h2 className="text-2xl font-bold mb-4">{t('infoHub.guidesTitle')}</h2>
        <p className="text-text-secondary mb-4">{t('infoHub.guidesSubtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('infoHub.guidesPlaceholder')}
            className="flex-grow px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            onClick={fetchGuide}
            disabled={isLoading || !topic.trim()}
            className="bg-secondary text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? t('infoHub.generating') : t('infoHub.getGuideBtn')}
          </button>
        </div>
        {guide && (
          <div className="mt-6 p-4 bg-slate-100/70 rounded-md">
            <article className="prose lg:prose-xl max-w-none text-text-primary" dangerouslySetInnerHTML={{__html: guide.replace(/\n/g, '<br />')}} />
          </div>
        )}
      </div>

      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 ring-1 ring-black/5 text-text-primary">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-secondary" />
            {t('infoHub.cropRecTitle')}
        </h2>
        <p className="text-text-secondary mb-4">{t('infoHub.cropRecSubtitle')}</p>
        
        {detectedLocation && (
          <div className="p-3 my-4 text-center text-sm bg-blue-900/50 backdrop-blur-sm text-blue-100 rounded-lg shadow">
              <p className="font-semibold">{t('infoHub.analyzedLocation')}: <span className="font-normal">{detectedLocation}</span></p>
          </div>
        )}
        
        <div className="mb-4">
            <button
                onClick={handleLocationRecommendation}
                disabled={isSuggesting}
                className="w-full bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-focus transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {isSuggesting ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : <LocationMarkerIcon className="w-5 h-5" />}
                {isSuggesting ? t('infoHub.analyzing') : t('infoHub.suggestCropsBtn')}
            </button>
        </div>
        
        <p className="text-center text-sm text-text-secondary my-4">{t('infoHub.manualPrompt')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input name="state" value={recInputs.state} onChange={handleInputChange} placeholder={t('infoHub.state')} className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"/>
            <select name="soilType" value={recInputs.soilType} onChange={handleInputChange} className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-white">
                <option value="">{t('infoHub.soilType')}</option>
                <option value="Alluvial">Alluvial</option>
                <option value="Black">Black (Regur)</option>
                <option value="Red and Yellow">Red and Yellow</option>
                <option value="Laterite">Laterite</option>
                <option value="Arid">Arid</option>
                <option value="Saline">Saline</option>
                <option value="Peaty">Peaty</option>
                <option value="Forest">Forest</option>
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
            </select>
            <input name="rainfall" value={recInputs.rainfall} onChange={handleInputChange} type="number" placeholder={t('infoHub.rainfall')} className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"/>
            <input name="temperature" value={recInputs.temperature} onChange={handleInputChange} type="number" placeholder={t('infoHub.temperature')} className="px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"/>
        </div>
        <button
            onClick={handleManualRecommendation}
            disabled={isManualRecButtonDisabled}
            className="w-full sm:w-auto bg-secondary text-white px-6 py-2 rounded-md font-semibold hover:bg-yellow-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex justify-center items-center"
        >
            {isSuggesting && !detectedLocation ? 'Analyzing...' : t('infoHub.getRecsBtn')}
        </button>
        {suggestionError && <div className="p-3 my-4 text-center text-sm bg-red-100 text-red-800 rounded-lg shadow">{suggestionError}</div>}
        {recommendations.length > 0 && (
            <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-text-primary">{t('infoHub.recommendedCropsTitle')}</h3>
                {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-slate-100/70 rounded-md border-l-4 border-primary">
                        <h4 className="font-bold text-lg text-primary">{rec.name}</h4>
                        <p className="text-sm font-semibold text-text-secondary mt-2">{t('infoHub.whyFit')}</p>
                        <p className="text-text-primary text-sm">{rec.reason}</p>
                        <p className="text-sm font-semibold text-text-secondary mt-2">{t('infoHub.cultivationTips')}</p>
                        <p className="text-text-primary text-sm">{rec.cultivation_details}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default InfoHub;