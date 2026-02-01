'use client';

import { useTranslation } from '@/lib/i18n';
import { Smartphone, Monitor, Share, MoreVertical, Download } from 'lucide-react';

export default function InstallAppSection() {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-background border-t border-primary/5 relative overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-24 space-y-4">
                <h2 className="text-primary font-bold tracking-[0.3em] uppercase text-xs">PWA Experience</h2>
                <p className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground">
                    {t('app.installApp')}
                </p>
                <p className="mt-6 max-w-3xl mx-auto text-xl text-muted-foreground/80 font-bold leading-relaxed">
                    {t('app.installDesc')}
                </p>
                <div className="flex justify-center pt-4">
                    <span className="h-1 w-16 bg-primary/30 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* iOS */}
                <div className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center group hover:scale-[1.02] bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-10 shadow-xl border border-primary/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <Smartphone className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-8">
                        {t('app.installIOS')}
                    </h3>
                    <div className="space-y-6">
                        <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed px-6">{t('app.installIOSStep')}</p>
                        <div className="inline-flex p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                            <Share size={28} className="text-primary" />
                        </div>
                    </div>
                </div>

                {/* Android */}
                <div className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center group hover:scale-[1.02] bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-10 shadow-xl border border-primary/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <Smartphone className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-8">
                        {t('app.installAndroid')}
                    </h3>
                    <div className="space-y-6">
                        <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed px-6">{t('app.installAndroidStep')}</p>
                        <div className="inline-flex p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                            <MoreVertical size={28} className="text-primary" />
                        </div>
                    </div>
                </div>

                {/* Desktop */}
                <div className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center group hover:scale-[1.02] bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-10 shadow-xl border border-primary/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                        <Monitor className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-8">
                        {t('app.installDesktop')}
                    </h3>
                    <div className="space-y-6">
                        <p className="text-sm font-bold text-muted-foreground/80 leading-relaxed px-6">{t('app.installDesktopStep')}</p>
                        <div className="inline-flex p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner group-hover:bg-primary/10 transition-colors">
                            <Download size={28} className="text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
