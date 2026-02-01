'use client';

import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-background text-foreground py-16 border-t border-primary/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-premium-gradient">
                {t('app.title')}
            </div>
            <div className="text-muted-foreground text-sm font-medium">
                © {new Date().getFullYear()} Restock App. All rights reserved.
            </div>
        </div>
    </footer>
  );
}
