import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import LanguageToggle from '../LanguageToggle';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <header className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-48">
        {/* Floating Guest Controls */}
        <div className="fixed top-6 right-6 z-50 flex gap-2">
            <div className="glass p-1 rounded-2xl flex gap-1 shadow-2xl scale-90 sm:scale-100 origin-right transition-all">
                <ThemeToggle />
                <div className="w-px bg-white/10 mx-1" />
                <LanguageToggle />
            </div>
        </div>
        {/* Background Blobs */}
        <div className="bg-blob bg-blue-500 -top-25 -left-25" />
        <div className="bg-blob bg-purple-500 -bottom-25 -right-25" style={{ animationDelay: '-5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 mb-6 drop-shadow-sm">
                {t('app.title')}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium">
                {t('app.welcome')}
            </p>

            {/* Hero Image with Glass effect */}
            <div className="mt-16 relative mx-auto w-full max-w-5xl rounded-4xl overflow-hidden glass p-3 transition-all duration-1000 hover:scale-[1.01] hover:rotate-1 animate-in zoom-in-95">
                <div className="rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative">
                    <Image
                        src="/hero_3d_illustration.png"
                        alt="Restock App Dashboard"
                        width={1200}
                        height={800}
                        className="w-full h-auto object-cover scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent pointer-events-none" />
                </div>
            </div>

            <div className="mt-12 flex justify-center gap-6">
                <Link
                    href="/login"
                    className="btn-premium text-lg px-12 py-4 relative group overflow-hidden flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all active:scale-95"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        {t('app.getStarted')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                    
                    {/* Background Pulse */}
                    <div className="absolute inset-0 bg-indigo-500/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>
        </div>
    </header>
  );
}
