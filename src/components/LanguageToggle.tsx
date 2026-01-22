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
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
      aria-label={t('settings.language')}
    >
      <Languages className="h-5 w-5" />
      <span className="font-medium text-sm">{locale.toUpperCase()}</span>
    </button>
  );
}
