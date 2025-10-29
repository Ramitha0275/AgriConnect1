import React, { useState, useEffect, useMemo } from 'react';
import { MarketInfo, CropPrice, CartItem } from '../types';
import { findMarkets } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { SearchIcon, ShoppingCartIcon, GPayIcon, CashIcon, TrashIcon, LocationMarkerIcon, CurrencyRupeeIcon, XIcon, PhoneIcon, CheckCircleIcon } from './icons/Icons';

const B2BPlatform: React.FC = () => {
    const { language, t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [markets, setMarkets] = useState<MarketInfo[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [orderStatus, setOrderStatus] = useState<'idle' | 'booked'>('idle');


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
            },
            () => {
                console.warn("Location access denied. Search results may not be sorted by proximity.");
            }
        );
    }, []);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        setSearchError('');
        setMarkets([]);
        try {
            const results = await findMarkets(`wholesale price for "${searchTerm}"`, language, location ?? undefined);
            setMarkets(results);
        } catch (e) {
            setSearchError(e instanceof Error ? e.message : t('common.error'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleQuantityChange = (marketId: number, cropName: string, value: string) => {
        const quantity = parseInt(value, 10);
        setQuantities(prev => ({
            ...prev,
            [`${marketId}-${cropName}`]: quantity > 0 ? quantity : 1,
        }));
    };

    const handleAddToCart = (market: MarketInfo, crop: CropPrice) => {
        const quantity = quantities[`${market.id}-${crop.name}`] || 1;
        if (quantity <= 0) return;

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => item.market.id === market.id && item.crop.name === crop.name);
            if (existingItemIndex > -1) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += quantity;
                return updatedCart;
            } else {
                return [...prevCart, { market, crop, quantity }];
            }
        });
        alert(t('b2b.addToCartSuccess', { quantity, cropName: crop.name }));
    };

    const handleRemoveFromCart = (marketId: number, cropName: string) => {
        setCart(prev => prev.filter(item => !(item.market.id === marketId && item.crop.name === cropName)));
    };
    
    const handleCheckout = (method: string) => {
        if (cart.length === 0) return;

        if (method === 'GPay') {
            const total = cartTotal.toFixed(2);
            const gpayUrl = `https://pay.google.com/gp/v/pay?pa=dummy-upi@pay&pn=AgriConnect&am=${total}&cu=INR&tn=B2B%20Order`;
            
            alert(`Redirecting to simulated GPay page to complete payment of ₹${cartTotal.toLocaleString('en-IN')}.`);
            window.open(gpayUrl, '_blank', 'noopener,noreferrer');
            
            setTimeout(() => {
                setCart([]);
                setIsCartOpen(false);
            }, 500);

        } else if (method === 'Cash on Delivery') {
            setOrderStatus('booked');
            setTimeout(() => {
                setIsCartOpen(false);
                setCart([]);
                setOrderStatus('idle'); 
            }, 3000);
        }
    };
    
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + (item.crop.price * item.quantity), 0);
    }, [cart]);


    const renderMarketplace = () => {
        if (isSearching) {
            return (
                <div className="text-center py-12">
                    <svg className="animate-spin mx-auto h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-2 text-slate-200">{t('common.searching')}</p>
                </div>
            );
        }
        if (searchError) {
            return <div className="p-4 my-4 text-center text-sm bg-red-900/60 backdrop-blur-sm text-red-100 rounded-lg shadow">{searchError}</div>;
        }
        if (markets.length > 0) {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {markets.map(market => {
                        const relevantCrop = market.crops.find(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
                        if (!relevantCrop) return null;
                        
                        const key = `${market.id}-${relevantCrop.name}`;
                        const currentQuantity = quantities[key] || 1;

                        return (
                             <div key={market.id} className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl ring-1 ring-black/5 text-text-primary overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
                                <div className="p-5">
                                    <h3 className="font-bold text-xl text-text-primary mb-2">{market.name}</h3>
                                    <div className="flex items-start gap-2 text-text-secondary text-sm mb-2">
                                        <LocationMarkerIcon className="w-4 h-4 flex-shrink-0 mt-1" />
                                        <span>{market.address}</span>
                                    </div>
                                    {market.phone && (
                                    <a href={`tel:${market.phone}`} className="flex items-center gap-2 text-text-secondary text-sm mb-4 hover:text-primary">
                                        <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>{market.phone}</span>
                                    </a>
                                    )}
                                    <div className="bg-white/50 p-3 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-text-primary">{relevantCrop.name}</span>
                                             <span className="font-bold text-lg text-primary flex items-center">
                                                <CurrencyRupeeIcon className="w-5 h-5 mr-1"/>{relevantCrop.price.toLocaleString('en-IN')}
                                                <span className="text-sm text-text-secondary ml-1">/ {t('common.kg')}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-black/10 p-3 flex items-center gap-2">
                                     <input
                                        type="number"
                                        min="1"
                                        value={currentQuantity}
                                        onChange={(e) => handleQuantityChange(market.id, relevantCrop.name, e.target.value)}
                                        className="w-20 px-2 py-1 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder={t('common.quantity')}
                                    />
                                    <span className="text-sm text-text-secondary">{t('common.kg')}(s)</span>
                                    <button 
                                        onClick={() => handleAddToCart(market, relevantCrop)}
                                        className="ml-auto bg-primary text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-primary-focus transition-colors text-sm"
                                    >
                                        <ShoppingCartIcon className="w-4 h-4" />
                                        {t('common.add')}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            );
        }
        return (
             <div className="text-center py-12 bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl ring-1 ring-black/5 mt-6 text-text-primary">
              <h3 className="text-xl font-semibold ">{t('b2b.findSuppliesTitle')}</h3>
              <p className="text-text-secondary mt-2">{t('b2b.findSuppliesSubtitle')}</p>
          </div>
        )
    };
    
    return (
        <div className="animate-fade-in text-white">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{t('b2b.title')}</h1>
            <p className="text-slate-200 mb-6" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{t('b2b.subtitle')}</p>

             <div className="flex gap-2 bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-lg">
                <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('b2b.searchPlaceholder')}
                className="w-full px-4 py-3 border border-white/30 bg-white/20 text-white placeholder-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="bg-primary text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-focus transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                <SearchIcon className="w-5 h-5" />
                <span className="hidden sm:inline">{isSearching ? t('common.searching') : t('common.search')}</span>
                </button>
            </div>

            {renderMarketplace()}
            
            {cart.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)} 
                    className="fixed bottom-8 right-8 bg-secondary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform">
                    <ShoppingCartIcon className="w-8 h-8"/>
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">{cart.length}</span>
                </button>
            )}

            {isCartOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col text-text-primary ring-1 ring-black/5">
                        <div className="flex justify-between items-center p-4 border-b border-black/10">
                            <h2 className="text-2xl font-bold">{t('b2b.yourCart')}</h2>
                            <button onClick={() => setIsCartOpen(false)}><XIcon className="w-6 h-6 text-text-secondary hover:text-text-primary"/></button>
                        </div>
                        {orderStatus === 'booked' ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center flex-grow">
                                <CheckCircleIcon className="w-16 h-16 text-primary mb-4" />
                                <h2 className="text-2xl font-bold text-primary">{t('b2b.orderBookedTitle')}</h2>
                                <p className="text-text-secondary mt-2">{t('b2b.orderBookedSubtitle', { total: cartTotal.toLocaleString('en-IN') })}</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 overflow-y-auto">
                                    {cart.length === 0 ? (
                                        <p>{t('b2b.cartEmpty')}</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map(item => (
                                                <div key={`${item.market.id}-${item.crop.name}`} className="flex items-center gap-4 border-b border-black/10 pb-4">
                                                    <div className="flex-grow">
                                                        <p className="font-bold text-lg">{item.crop.name}</p>
                                                        <p className="text-sm text-text-secondary">{item.market.name}, {item.market.city}</p>
                                                        <p className="text-sm text-text-primary mt-1">
                                                            {item.quantity} {t('common.kg')}(s) x ₹{item.crop.price.toLocaleString('en-IN')} / {t('common.kg')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-primary text-lg">
                                                            ₹{(item.quantity * item.crop.price).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => handleRemoveFromCart(item.market.id, item.crop.name)} className="text-red-500 hover:text-red-700">
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 mt-auto border-t border-black/10">
                                    <div className="flex justify-between items-center text-xl font-bold mb-4">
                                        <span>{t('b2b.total')}</span>
                                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button onClick={() => handleCheckout('GPay')} disabled={cart.length === 0} className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors disabled:bg-slate-400">
                                        <GPayIcon className="w-6 h-6"/>
                                        {t('b2b.gpayBtn')}
                                    </button>
                                    <button onClick={() => handleCheckout('Cash on Delivery')} disabled={cart.length === 0} className="w-full bg-green-500 text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:bg-slate-400">
                                        <CashIcon className="w-6 h-6"/>
                                        {t('b2b.codBtn')}
                                    </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default B2BPlatform;