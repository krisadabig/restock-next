'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun, Globe, LogOut, Trash2, X, ArrowLeft, Settings, Fingerprint, ShieldCheck } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import { registerPasskey } from '@/lib/auth';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  // const supabase = createClient(); // Supabase client removed
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
      // In a real app, you'd call a function to delete the user data and then sign out.
      // We'll just sign them out and redirect for this demo/MVP.
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
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('settings.title')}
          </h1>
        </div>
      </div>

      {/* Appearance Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('settings.appearance')}
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-400" />
              )}
              <span className="text-gray-900 dark:text-white font-medium">
                {t('settings.theme')}
              </span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 relative">
              <button
                onClick={() => setTheme('light')}
                className={`relative z-10 flex-1 px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                  theme === 'light' ? 'text-indigo-600' : 'text-slate-400 opacity-50'
                }`}
              >
                <Sun size={18} />
                {t('settings.lightMode')}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`relative z-10 flex-1 px-4 py-2 rounded-xl text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-slate-500 opacity-50'
                }`}
              >
                <Moon size={18} />
                {t('settings.darkMode')}
              </button>
              {/* Slider overlay */}
              <div 
                className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 shadow-xl rounded-xl transition-all duration-500 ease-spring ${
                  theme === 'dark' ? 'left-[calc(50%+2px)]' : 'left-1'
                }`}
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-emerald-500" />
              <span className="text-gray-900 dark:text-white font-medium">
                {t('settings.language')}
              </span>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('settings.langEn')}
              </button>
              <button
                onClick={() => setLocale('th')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  locale === 'th'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {t('settings.langTh')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section (Passkeys) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Security
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Fingerprint className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-gray-900 dark:text-white font-medium">Passkeys</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Use your fingerprint, face, or screen lock to sign in faster.
                    </p>
                </div>
            </div>
            
            {passkeyMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    passkeyMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                    <ShieldCheck className="h-4 w-4" />
                    {passkeyMsg.text}
                </div>
            )}

            <button
                onClick={handleAddPasskey}
                disabled={passkeyLoading}
                className="w-full py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-[0.98] disabled:opacity-50"
            >
                {passkeyLoading ? 'Processing...' : 'Add Passkey'}
            </button>
        </div>
      </section>

      {/* Account Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('settings.account')}
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium">
              {isLoggingOut ? t('app.processing') : t('app.logout')}
            </span>
            {isLoggingOut && <div className="ml-auto w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
            <span className="text-red-600 dark:text-red-400 font-medium">
              {t('settings.deleteAccount')}
            </span>
          </button>
        </div>
      </section>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('settings.confirmDeleteTitle')}
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t('settings.confirmDeleteDesc')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {t('settings.typeToDelete')}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('settings.deletePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? t('settings.deleting') : t('settings.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
