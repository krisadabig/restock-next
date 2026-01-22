'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { loginPasskey } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();
  
  const [method, setMethod] = useState<'password' | 'passkey'>('password');
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authState, setAuthState] = useState<'idle' | 'authenticating' | 'registering'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        if (isSignup) {
            if (!username) throw new Error('Username is required for signup');
            
            // 1. Sign up with Supabase
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                    }
                }
            });

            if (signupError) throw signupError;
            if (!data.user) throw new Error('Signup failed');

            // 2. User sync is handled by database trigger (recommended)
            // But if we don't have the trigger yet, we could do it here.
            // Let's assume we'll use a trigger or handle it in a separate logic.
            // For now, redirect to app. Supabase will handle the session.
            router.push('/app');
        } else {
            // 1. Sign in with Supabase
            const { error: signinError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signinError) throw signinError;
            
            router.push('/app');
        }
    } catch (err) {
        setLoading(false);
        setError((err as Error).message);
    }
  };

  const handlePasskeySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setAuthState('authenticating');
      
      try {
        await loginPasskey(username);
        setAuthState('idle');
        router.push('/app');
      } catch (err) {
          setLoading(false);
          setAuthState('idle');
          setError((err as Error).message);
      }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative flex items-center justify-center p-4">
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
                    onClick={() => {
                        setMethod('password');
                        setError('');
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'password'
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Password
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMethod('passkey');
                        setIsSignup(false);
                        setError('');
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'passkey'
                        ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Passkey
                </button>
            </div>

            {method === 'password' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                        <input
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('app.username')}
                            className="block w-full rounded-xl border-0 bg-gray-100 p-4 text-center text-lg font-semibold lowercase text-black placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-700 transition-all shadow-sm"
                        />
                    )}
                    <input
                        name="email"
                        type="email"
                        required={!isSignup}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email address"
                        className="block w-full rounded-xl border-0 bg-gray-100 p-4 text-center text-lg font-semibold text-black placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-700 transition-all shadow-sm"
                    />
                    <input
                        name="password"
                        type="password"
                        required={!isSignup}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError('');
                        }}
                        className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handlePasskeySubmit} className="space-y-4">
                    <div className="group relative">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('app.username')}
                            autoComplete="username webauthn"
                            className="block w-full rounded-xl border-0 bg-gray-100 p-4 text-center text-lg font-semibold lowercase text-black placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-black dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-700 dark:focus:bg-gray-800 dark:focus:ring-white transition-all shadow-sm"
                        />
                    </div>

                    {error && (
                        <div className="text-center text-sm font-medium text-red-500 animate-pulse">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-black py-3.5 text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-white dark:text-black disabled:opacity-70"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>
                                        {authState === 'authenticating'
                                            ? t('app.authenticating')
                                            : authState === 'registering'
                                            ? t('app.creatingAccount')
                                            : t('app.processing')}
                                    </span>
                                </>
                            ) : (
                                t('app.continue')
                            )}
                        </span>
                    </button>
                </form>
            )}
        </div>
    </div>
  );
}
