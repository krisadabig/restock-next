'use client';

import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                {t('app.title')}
            </div>
            <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Restock App. All rights reserved.
            </div>
        </div>
    </footer>
  );
}
