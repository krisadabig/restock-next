'use client';

import { useTranslation } from '@/lib/i18n';

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-foreground">{t('error.title')}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white"
      >
        {t('error.retry')}
      </button>
    </div>
  );
}
