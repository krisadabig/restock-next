'use client';

import { useActionState, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { login, signup } from '../auth/actions';

export default function LoginPage() {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [method, setMethod] = useState<'password' | 'passkey'>('password');
  
  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  const error = isSignup ? signupState?.error : loginState?.error;
  const loading = isSignup ? isSignupPending : isLoginPending;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative flex items-center justify-center p-4">
        {/* Floating Guest Controls */}
        <div className="fixed top-6 right-6 z-50 flex gap-2">
            <div className="glass p-1 rounded-2xl flex gap-1 shadow-2xl scale-90 sm:scale-100 origin-right transition-all">
                <ThemeToggle />
                <div className="w-px bg-white/10 mx-1" />
                <LanguageToggle />
            </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-black dark:bg-white mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white dark:text-black"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m21 21-4.3-4.3" /><circle cx="10" cy="10" r="7" /><path d="M10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-black dark:text-white sm:text-5xl">
                    Restock<span className="text-indigo-600">.</span>
                </h1>
                <p className="text-gray-400 dark:text-gray-500 font-medium">
                    {isSignup ? t('app.signupSubtitle') : t('app.loginSubtitle')}
                </p>
            </div>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
                <button
                    type="button"
                    onClick={() => setMethod('password')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'password'
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Password
                </button>
                <button
                    type="button"
                    onClick={() => setMethod('passkey')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'passkey'
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Passkey
                </button>
            </div>

            {method === 'password' ? (
                <form action={isSignup ? signupAction : loginAction} className="space-y-4">
                    <input
                        name="username"
                        type="text"
                        required
                        placeholder={t('app.username')}
                        className="block w-full rounded-xl border-0 bg-gray-100 p-4 text-center text-lg font-semibold lowercase text-black placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-700 transition-all shadow-sm"
                    />
                    
                    <input
                        name="password"
                        type="password"
                        required
                        placeholder="password"
                        className="block w-full rounded-xl border-0 bg-gray-100 p-4 text-center text-lg font-semibold text-black placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-700 transition-all shadow-sm"
                    />

                    {error && (
                        <div className="text-center text-sm font-medium text-red-500 animate-pulse">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-black py-3.5 text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-white dark:text-black disabled:opacity-70"
                    >
                        {loading ? t('app.processing') : isSignup ? t('app.signup') : t('app.login')}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSignup(!isSignup)}
                        className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                    </button>
                </form>
            ) : (
                <div className="text-center py-8">
                   <p className="text-gray-500 dark:text-gray-400 mb-4">Passkey login is temporarily disabled during system upgrade.</p>
                   <button
                        type="button"
                        onClick={() => setMethod('password')}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                        Use Password
                   </button>
                </div>
            )}
        </div>
    </div>
  );
}
