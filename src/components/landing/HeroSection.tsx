import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import LanguageToggle from '../LanguageToggle';

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <header className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 bg-background">
        {/* Floating Controls */}
        <div className="fixed top-6 right-6 z-50 flex gap-3 animate-in fade-in duration-1000 delay-500">
            <div className="glass-panel p-2 rounded-2xl flex gap-2 shadow-2xl border border-primary/10 transition-all hover:scale-105">
                <ThemeToggle />
                <div className="w-px bg-primary/10 mx-1" />
                <LanguageToggle />
            </div>
        </div>

        {/* Cinematic Backdrop Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[160px] animate-float opacity-30 pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 rounded-full blur-[160px] animate-float opacity-20 pointer-events-none" style={{ animationDelay: '-5s' }} />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 text-center space-y-12 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <div className="space-y-4">
                <h1 className="text-7xl md:text-[6rem] lg:text-[7.5rem] font-bold tracking-tighter text-premium-gradient leading-none">
                    Restock<span className="text-foreground">.</span>
                </h1>
                <div className="flex justify-center">
                    <span className="h-1.5 w-24 bg-primary/20 rounded-full" />
                </div>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed opacity-80">
                    {t('app.welcome')}
                </p>
            </div>

            {/* Premium Hero App Showcase */}
            <div className="mt-16 relative mx-auto w-full max-w-5xl rounded-[3rem] p-1 bg-linear-to-b from-primary/20 via-primary/5 to-transparent shadow-3xl">
                <div className="rounded-[2.9rem] overflow-hidden glass-card p-2 group">
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative aspect-21/9 sm:aspect-video bg-secondary/20">
                        <Image
                            src="/hero_3d_illustration.png"
                            alt="Restock PWA Dashboard"
                            fill
                            className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Interactive UI Hint */}
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                            <div className="glass shadow-2xl p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left-6 duration-700 delay-500">
                                <div className="h-2 w-12 bg-primary/40 rounded-full mb-2" />
                                <div className="h-1 w-24 bg-muted-foreground/20 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Link
                    href="/login"
                    className="group relative inline-flex items-center gap-3 bg-primary text-white px-12 py-6 rounded-2xl font-bold text-xl hover:scale-[1.05] active:scale-95 transition-all login-glow shadow-2xl shadow-primary/30"
                >
                    {t('app.getStarted')}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <button className="px-12 py-6 rounded-2xl font-bold text-xl text-foreground hover:bg-secondary/30 transition-all border border-primary/5 active:scale-95">
                    Explore Features
                </button>
            </div>
        </div>
    </header>
  );
}
