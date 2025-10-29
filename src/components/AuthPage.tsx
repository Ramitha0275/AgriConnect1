import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onSwitchMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { t } = useLanguage();

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?q=80&w=1974&auto=format&fit=crop')" }}
    >
        <div className="absolute top-4 right-4 z-20">
            <LanguageSelector />
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-md w-full bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-2xl shadow-2xl text-white">
            <div className="text-center mb-8">
                <img className="h-12 w-auto mx-auto mb-2" src="https://img.icons8.com/color/48/000000/leaf.png" alt="AgriConnect Logo" />
                <h2 className="text-3xl font-bold text-white">{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h2>
                <p className="text-slate-200 mt-2">{isLogin ? t('auth.signInToContinue') : t('auth.getStarted')}</p>
            </div>

            {error && (
                <div className="bg-red-500/50 border border-red-400 text-white px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-100">
                    {t('auth.fullName')}
                </label>
                <div className="mt-1">
                    <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm bg-white/20 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John Doe"
                    />
                </div>
                </div>
            )}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-100">
                {t('auth.email')}
                </label>
                <div className="mt-1">
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm bg-white/20 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@example.com"
                />
                </div>
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-100">
                {t('auth.password')}
                </label>
                <div className="mt-1">
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm bg-white/20 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                />
                </div>
            </div>

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-green-800"
                >
                {isLoading ? t('auth.processing') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
                </button>
            </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-200">
            {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            <button onClick={onSwitchMode} className="font-medium text-primary hover:text-green-300">
                {isLogin ? t('auth.signUpHere') : t('auth.signInHere')}
            </button>
            </p>
        </div>
    </div>
  );
};

export default AuthPage;