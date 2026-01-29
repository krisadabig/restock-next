'use client';

import { useActionState, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { loginPasskey } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { login, signup } from '../auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [method, setMethod] = useState<'password' | 'passkey'>('password');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  
  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, null);

  const error = isSignup ? signupState?.error : loginState?.error;
  const loading = isSignup ? isSignupPending : isLoginPending;

  const handlePasskeyLogin = async () => {
      setPasskeyError(null);
      setIsPasskeyLoading(true);
      try {
          await loginPasskey();
          router.push('/app');
      } catch (err) {
          setPasskeyError((err as Error).message);
          setIsPasskeyLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
        {/* Floating Guest Controls */}
        <div className="fixed top-6 right-6 z-50 flex gap-2 animate-in fade-in duration-1000 delay-500">
            <div className="glass-panel p-1.5 rounded-full flex gap-1 shadow-2xl">
                <ThemeToggle />
                <div className="w-px bg-border mx-1" />
                <LanguageToggle />
            </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-float opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-float opacity-50" style={{ animationDelay: '-3s' }} />
        </div>

        <div className="w-full max-w-sm relative z-10 space-y-8 animate-in zoom-in-95 fade-in duration-700">
            {/* Logo Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transform hover:scale-110 transition-transform duration-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-white"
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
                <div>
                    <h1 className="text-5xl font-black tracking-tighter text-foreground font-heading">
                        Restock<span className="text-primary text-6xl">.</span>
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs mt-2">
                        {isSignup ? t('app.signupSubtitle') : t('app.loginSubtitle')}
                    </p>
                </div>
            </div>

            {/* Auth Card */}
            <div className="glass-card p-1 rounded-[2rem]">
                <div className="bg-background/50 backdrop-blur-sm rounded-[1.8rem] p-6 space-y-6">
                    {/* Method Toggle */}
                    <div className="flex p-1 bg-secondary rounded-xl">
                        <button
                            type="button"
                            onClick={() => setMethod('password')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === 'password'
                                ? 'bg-background text-foreground shadow-sm scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Password
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('passkey')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${method === 'passkey'
                                ? 'bg-background text-foreground shadow-sm scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Passkey
                        </button>
                    </div>

                    {method === 'password' ? (
                        <form action={isSignup ? signupAction : loginAction} className="space-y-4">
                            <div className="space-y-3">
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    placeholder={t('app.username')}
                                    className="block w-full rounded-xl border border-border bg-secondary/50 p-4 text-center text-lg font-semibold placeholder:text-muted-foreground/50 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                />
                                
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-border bg-secondary/50 p-4 text-center text-lg font-semibold placeholder:text-muted-foreground/50 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                />
                            </div>

                            {error && (
                                <div className="text-center text-sm font-bold text-destructive animate-pulse bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary-glow h-14 rounded-xl text-lg font-bold"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('app.processing')}
                                    </span>
                                ) : isSignup ? t('app.signup') : t('app.login')}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsSignup(!isSignup)}
                                className="w-full py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                            >
                                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center py-2">
                             <div className="p-6 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                 <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                                 <div className="relative flex flex-col items-center">
                                     <div className="p-4 bg-background rounded-full shadow-lg mb-4">
                                         <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             className="h-8 w-8 text-primary"
                                             fill="none"
                                             viewBox="0 0 24 24"
                                             stroke="currentColor"
                                             strokeWidth={2}
                                         >
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                                         </svg>
                                     </div>
                                     <h3 className="font-bold text-foreground text-lg">Passkey Ready</h3>
                                     <p className="text-xs text-muted-foreground mt-2 max-w-50">Use FaceID, TouchID or your security key to login instantly.</p>
                                 </div>
                             </div>
        
                             {passkeyError && (
                                <div className="text-center text-sm font-bold text-destructive animate-pulse bg-destructive/10 p-3 rounded-lg border border-destructive/20">{passkeyError}</div>
                             )}
        
                             <button
                                type="button"
                                onClick={handlePasskeyLogin}
                                disabled={isPasskeyLoading}
                                className="w-full btn-primary-glow h-14 rounded-xl text-lg font-bold flex items-center justify-center gap-2"
                            >
                                {isPasskeyLoading ? (
                                     <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('app.processing')}
                                     </>
                                ) : (
                                    "Log in with Passkey"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
