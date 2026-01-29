'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun, Globe, LogOut, Trash2, X, ArrowLeft, Fingerprint, ShieldCheck, ChevronRight } from 'lucide-react';
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
    <div className="p-6 space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 -ml-3 hover:bg-secondary/50 rounded-full transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-foreground font-heading tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
             Manage your preferences
          </p>
        </div>
      </div>

      {/* Appearance Island */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
          {t('settings.appearance')}
        </h2>
        <div className="glass-panel overflow-hidden rounded-3xl divide-y divide-border/50">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-600'}`}>
                 {theme === 'light' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </div>
              <div>
                  <span className="block text-base font-bold text-foreground">
                    {t('settings.theme')}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                  </span>
              </div>
            </div>
            
            <div className="flex bg-secondary p-1 rounded-xl border border-border/50 relative isolate">
              <button
                onClick={() => setTheme('light')}
                className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                  theme === 'light' ? 'text-amber-600' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sun size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Moon size={20} strokeWidth={2.5} />
              </button>
              {/* Active Pill */}
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-background shadow-sm rounded-lg transition-all duration-500 ease-spring ${
                  theme === 'dark' ? 'translate-x-full left-1' : 'left-1'
                }`}
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                 <Globe className="h-6 w-6" />
              </div>
              <span className="text-base font-bold text-foreground">
                {t('settings.language')}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLocale('en')}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${
                  locale === 'en'
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('th')}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${
                  locale === 'th'
                    ? 'bg-primary/10 border-primary/20 text-primary'
                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-secondary'
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
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
          Security
        </h2>
        <div className="glass-panel p-5 rounded-3xl space-y-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                    <Fingerprint className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-base font-bold text-foreground">Passkeys</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Secure your account with biometric authentication (FaceID, TouchID).
                    </p>
                </div>
            </div>
            
            {passkeyMsg && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2 ${
                    passkeyMsg.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    {passkeyMsg.text}
                </div>
            )}

            <button
                onClick={handleAddPasskey}
                disabled={passkeyLoading}
                className="w-full btn-primary-glow py-4 rounded-xl font-bold flex items-center justify-center gap-2 group"
            >
                {passkeyLoading ? (
                    'Processing...' 
                ) : (
                    <>
                        Add New Passkey
                        <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </div>
      </section>

      {/* Account Island */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
          {t('settings.account')}
        </h2>
        <div className="glass-panel overflow-hidden rounded-3xl divide-y divide-border/50">
          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <div className="p-3 rounded-full bg-secondary text-muted-foreground">
                <LogOut className="h-6 w-6" />
            </div>
            <span className="flex-1 text-base font-bold text-foreground">
              {isLoggingOut ? t('app.processing') : t('app.logout')}
            </span>
            {isLoggingOut && <div className="ml-auto w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-4 p-5 text-left hover:bg-destructive/5 transition-colors group"
          >
            <div className="p-3 rounded-full bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                <Trash2 className="h-6 w-6" />
            </div>
            <span className="text-base font-bold text-destructive group-hover:translate-x-1 transition-transform">
              {t('settings.deleteAccount')}
            </span>
          </button>
        </div>
      </section>
      
      {/* Version Footer */}
      <div className="text-center pt-8">
        <p className="text-xs font-mono font-bold text-muted-foreground/30 uppercase tracking-widest">
            Restock v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
        </p>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowDeleteModal(false)} />
          
          <div className="relative w-full max-w-sm glass-card p-1 rounded-[2rem] animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="bg-background/80 backdrop-blur-lg rounded-[1.8rem] p-6 space-y-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-destructive">
                    {t('settings.confirmDeleteTitle')}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {t('settings.confirmDeleteDesc')}
                    </p>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase opacity-70">{t('settings.typeToDelete')}</label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          placeholder={t('settings.deletePlaceholder')}
                          className="w-full px-4 py-3 border border-border bg-secondary/50 rounded-xl text-foreground font-bold focus:ring-2 focus:ring-destructive/50 focus:border-destructive outline-none transition-all placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-destructive/20"
                  >
                    {isDeleting ? t('settings.deleting') : t('settings.confirm')}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
