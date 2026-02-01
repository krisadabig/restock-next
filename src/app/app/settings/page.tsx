'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun, Globe, LogOut, Trash2, ArrowLeft, Fingerprint, ShieldCheck, ChevronRight } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import { registerPasskey } from '@/lib/auth';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyMsg(null);
    try {
        await registerPasskey(); 
        setPasskeyMsg({ type: 'success', text: 'Passkey added successfully!' });
    } catch (err) {
        setPasskeyMsg({ type: 'error', text: (err as Error).message });
    } finally {
        setPasskeyLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-40 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.back()}
          className="h-14 w-14 flex items-center justify-center -ml-4 bg-secondary/20 hover:bg-primary/10 rounded-2xl transition-all active:scale-95 border border-primary/5 shadow-md"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] mt-1">
             Preferences
          </p>
        </div>
      </div>

      {/* Appearance Island */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          {t('settings.appearance')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-inner border border-primary/5 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-600'}`}>
                 {theme === 'light' ? <Sun className="h-6 w-6" strokeWidth={2.5} /> : <Moon className="h-6 w-6" strokeWidth={2.5} />}
              </div>
              <div>
                  <span className="block text-lg font-bold text-foreground leading-tight">
                    {t('settings.theme')}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium opacity-60">
                    {theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                  </span>
              </div>
            </div>
            
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 relative isolate shadow-inner">
              <button
                onClick={() => setTheme('light')}
                className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
                  theme === 'light' ? 'text-amber-600' : 'text-muted-foreground/40 hover:text-foreground'
                }`}
              >
                <Sun size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground/40 hover:text-foreground'
                }`}
              >
                <Moon size={20} strokeWidth={2.5} />
              </button>
              {/* Active Pill */}
              <div 
                className={`absolute inset-y-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-background shadow-lg rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-primary/10 ${
                  theme === 'dark' ? 'translate-x-full left-1.5' : 'left-1.5'
                }`}
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner border border-primary/5">
                 <Globe className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-foreground">
                {t('settings.language')}
              </span>
            </div>
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 shadow-inner">
              <button
                onClick={() => setLocale('en')}
                className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${
                  locale === 'en'
                    ? 'bg-background text-primary shadow-lg border border-primary/10'
                    : 'text-muted-foreground/40 hover:text-foreground'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('th')}
                className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${
                  locale === 'th'
                    ? 'bg-background text-primary shadow-lg border border-primary/10'
                    : 'text-muted-foreground/40 hover:text-foreground'
                }`}
              >
                TH
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Island */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          Security
        </h2>
        <div className="glass-card p-6 rounded-[2rem] space-y-6">
            <div className="flex items-start gap-5">
                <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner border border-primary/5 shrink-0">
                    <Fingerprint className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-1 pt-1">
                    <p className="text-lg font-bold text-foreground leading-tight">Passkeys</p>
                    <p className="text-sm text-muted-foreground font-medium opacity-60 leading-relaxed">
                        Secure your account with FaceID or TouchID.
                    </p>
                </div>
            </div>
            
            {passkeyMsg && (
                <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-2 duration-500 border ${
                    passkeyMsg.type === 'success' 
                        ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' 
                        : 'bg-red-500/5 text-red-500 border-red-500/10'
                }`}>
                    <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2.5} />
                    {passkeyMsg.text}
                </div>
            )}

            <button
                onClick={handleAddPasskey}
                disabled={passkeyLoading}
                className="w-full h-15 bg-primary text-white font-bold rounded-2xl shadow-lg login-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 group"
            >
                {passkeyLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                ) : (
                    <>
                        Add New Passkey
                        <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
      </section>

      {/* Account Island */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          {t('settings.account')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/5 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-secondary/40 text-muted-foreground shadow-inner border border-primary/5">
                <LogOut className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-lg font-bold text-foreground">
              {isLoggingOut ? t('app.processing') : t('app.logout')}
            </span>
            {isLoggingOut && <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-5 p-6 text-left hover:bg-red-500/5 transition-all group active:scale-[0.98]"
          >
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform shadow-inner border border-red-500/5">
                <Trash2 className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-red-500 group-hover:translate-x-1 transition-transform">
              {t('settings.deleteAccount')}
            </span>
          </button>
        </div>
      </section>
      
      {/* Version Footer */}
      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
            Restock v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
        </p>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative glass w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-500 border border-primary/10 overflow-hidden">
             {/* Drag Handle for Mobile */}
            <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2"></div>

            <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6">
                <div className="h-20 w-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner border border-red-500/10">
                    <Trash2 className="text-red-500" size={36} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">
                      {t('settings.confirmDeleteTitle')}
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {t('settings.confirmDeleteDesc')}
                    </p>
                </div>
                
                <div className="w-full space-y-2">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1 block text-left">{t('settings.typeToDelete')}</label>
                    <input
                      type="text"
                      autoFocus
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={t('settings.deletePlaceholder')}
                      className="w-full h-14 px-5 bg-secondary/30 border border-primary/5 focus:border-red-500/30 focus:bg-secondary/50 focus:ring-4 focus:ring-red-500/5 rounded-2xl transition-all text-foreground font-bold text-center"
                    />
                </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="h-14 bg-secondary/30 text-foreground font-bold rounded-2xl hover:bg-secondary/50 transition-all active:scale-95 disabled:opacity-50 border border-primary/5"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="h-14 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                ) : t('settings.confirm')}
              </button>
            </div>
            <div className="h-[calc(1.5rem+env(safe-area-inset-bottom))] sm:hidden"></div>
          </div>
        </div>
      )}
    </div>
  );
}
