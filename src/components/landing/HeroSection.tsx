import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <header className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-600 mb-6">
                {t('app.title')}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
                {t('app.welcome')}
            </p>

            {/* Hero Image */}
            <div className="mt-12 relative mx-auto w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border-4 border-white/20 dark:border-gray-700/50">
                <Image
                    src="/images/hero.png"
                    alt="Restock App Dashboard"
                    width={1200}
                    height={800}
                    className="w-full h-auto object-cover"
                    priority
                />
            </div>

            <div className="mt-10 flex justify-center gap-4">
                <Link
                    href="/login"
                    className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg md:px-10 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:-translate-y-1"
                >
                    {t('app.getStarted')}
                </Link>
            </div>
        </div>

        {/* Background Elements */}
        {/* We can add these later or now */}
    </header>
  );
}
