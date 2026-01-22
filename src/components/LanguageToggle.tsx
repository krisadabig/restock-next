'use client';

import { useTranslation } from '@/lib/i18n';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'th' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="glass px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 font-medium text-sm"
      aria-label={t('settings.language')}
    >
      <Languages size={18} className="text-indigo-500" />
      <span className="text-slate-600 dark:text-slate-300">
        {locale.toUpperCase()}
      </span>
    </button>
  );
}
