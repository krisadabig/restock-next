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
    <div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
        {/* Floating Guest Controls */}
        <div className="fixed top-6 right-6 z-50 animate-in fade-in duration-1000 delay-500">
            <div className="glass-panel p-2 rounded-2xl flex gap-2 shadow-2xl border border-primary/10">
                <ThemeToggle />
                <div className="w-px bg-primary/10 mx-1" />
                <LanguageToggle />
            </div>
        </div>
        
        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-float opacity-40" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-float opacity-30" style={{ animationDelay: '-4s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-linear-to-b from-transparent via-primary/5 to-transparent opacity-50" />
        </div>

        <div className="w-full max-w-md relative z-10 space-y-12 animate-in zoom-in-95 fade-in duration-1000">
            {/* Logo Section */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-[2.5rem] bg-linear-to-br from-primary/30 to-primary/10 shadow-2xl border border-primary/20 transition-all duration-700 hover:scale-110 hover:rotate-3 login-glow group">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-500"
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
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold tracking-tighter text-foreground">
                        Restock<span className="text-primary">.</span>
                    </h1>
                    <div className="flex flex-col items-center">
                        <span className="h-1 w-12 bg-primary/30 rounded-full mb-4" />
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">
                            {isSignup ? "Create Account" : "Secure Portal"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Auth Container */}
            <div className="glass-card p-1 rounded-[2.5rem] shadow-3xl">
                <div className="bg-background/40 backdrop-blur-3xl rounded-[2.4rem] p-8 space-y-8 border border-white/5">
                    {/* Header with Switcher */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-foreground">
                            {isSignup ? t('app.signup') : t('app.login')}
                        </h2>
                        <div className="flex bg-secondary/50 p-1 rounded-xl border border-primary/5 shadow-inner scale-90 sm:scale-100">
                            <button
                                onClick={() => setMethod('password')}
                                className={`h-10 px-4 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${method === 'password'
                                    ? 'bg-background text-primary shadow-lg border border-primary/10'
                                    : 'text-muted-foreground/50 hover:text-foreground'}`}
                            >
                                Password
                            </button>
                            <button
                                onClick={() => setMethod('passkey')}
                                className={`h-10 px-4 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${method === 'passkey'
                                    ? 'bg-background text-primary shadow-lg border border-primary/10'
                                    : 'text-muted-foreground/50 hover:text-foreground'}`}
                            >
                                Passkey
                            </button>
                        </div>
                    </div>

                    {/* Form State */}
                    <div className="space-y-6">
                        {method === 'password' ? (
                            <form action={isSignup ? signupAction : loginAction} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group space-y-1.5 transition-all duration-300">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-2">Username</label>
                                        <input
                                            name="username"
                                            type="text"
                                            required
                                            placeholder={t('app.username')}
                                            className="input-premium"
                                        />
                                    </div>
                                    
                                    <div className="group space-y-1.5 transition-all duration-300">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Password</label>
                                            {!isSignup && <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest opacity-80">Forgot?</button>}
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="input-premium"
                                        />
                                    </div>

                                    {isSignup && (
                                        <div className="group space-y-1.5 animate-in slide-in-from-top-4 duration-500">
                                            <label className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.2em] ml-2">{t('app.confirmPassword')}</label>
                                            <input
                                                name="confirmPassword"
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                className="input-premium"
                                            />
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="text-center text-xs font-bold text-red-400 bg-red-500/5 p-4 rounded-xl border border-red-500/10 animate-in slide-in-from-top-2">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white h-16 rounded-2xl text-lg font-bold login-glow shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                    {loading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('app.processing')}
                                        </>
                                    ) : (
                                        <>
                                            <span>{isSignup ? t('app.signup') : t('app.login')}</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-8 text-center py-2 animate-in fade-in zoom-in-95 duration-500">
                                 <div className="p-8 glass-card rounded-[2rem] bg-primary/5 border-primary/10 shadow-inner group relative overflow-hidden">
                                     <div className="relative z-10 flex flex-col items-center">
                                         <div className="p-5 bg-primary/20 rounded-full mb-6 shadow-xl border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                             <svg
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 className="h-10 w-10 text-primary"
                                                 fill="none"
                                                 viewBox="0 0 24 24"
                                                 stroke="currentColor"
                                                 strokeWidth={2}
                                             >
                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.59-4.18" />
                                             </svg>
                                         </div>
                                         <h3 className="font-bold text-foreground text-xl">Passkey Ready</h3>
                                         <p className="text-xs text-muted-foreground/60 mt-2 font-medium">
                                             Biometric security detected.
                                         </p>
                                     </div>
                                 </div>
            
                                 {passkeyError && (
                                    <div className="text-center text-xs font-bold text-red-400 bg-red-500/5 p-4 rounded-xl border border-red-500/10 animate-in slide-in-from-top-2">
                                        {passkeyError}
                                    </div>
                                 )}
            
                                 <button
                                    type="button"
                                    onClick={handlePasskeyLogin}
                                    disabled={isPasskeyLoading}
                                    className="w-full bg-primary text-white h-16 rounded-2xl text-lg font-bold login-glow shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isPasskeyLoading ? (
                                         <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('app.processing')}
                                         </>
                                    ) : (
                                        <>
                                            <span>Authenticate</span>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Toggle */}
                    <div className="pt-4 border-t border-primary/5 flex flex-col items-center">
                        <p className="text-xs text-muted-foreground/40 font-bold mb-4 uppercase tracking-[0.2em]">
                            {isSignup ? "Already tracking?" : "New here?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsSignup(!isSignup)}
                            className="group flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-all active:scale-95"
                        >
                            <span>{isSignup ? t('app.login') : t('app.signup')}</span>
                            <div className="h-2 w-2 rounded-full bg-primary group-hover:animate-pulse" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hint Footer */}
            <div className="text-center space-y-2 opacity-30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Integrated Security Protocol</p>
                <p className="text-[9px] font-mono text-muted-foreground/60 uppercase">Version 2.0.4-premium</p>
            </div>
        </div>
    </div>
  );
}
