'use client';

import { useTranslation } from '@/lib/i18n';
import { CheckCircle, BarChart3, Bell } from 'lucide-react';

export default function FeatureSection() {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-background relative overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-24 space-y-4">
                <h2 className="text-primary font-bold tracking-[0.3em] uppercase text-xs">
                    {t('app.features')}
                </h2>
                <p className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground">
                    {t('app.subtitle')}
                </p>
                <div className="flex justify-center">
                    <span className="h-1 w-16 bg-primary/30 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Feature 1 */}
                <div className="glass-card p-12 rounded-[2.5rem] group hover:scale-[1.02] shadow-3xl bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-primary/10">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">
                        {t('app.feature1')}
                    </h3>
                    <p className="text-muted-foreground/80 leading-relaxed font-bold text-sm">
                        {t('app.feature1Desc')}
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="glass-card p-12 rounded-[2.5rem] group hover:scale-[1.02] shadow-3xl bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-primary/10">
                        <BarChart3 className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">
                        {t('app.feature2')}
                    </h3>
                    <p className="text-muted-foreground/80 leading-relaxed font-bold text-sm">
                        {t('app.feature2Desc')}
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="glass-card p-12 rounded-[2.5rem] group hover:scale-[1.02] shadow-3xl bg-linear-to-b from-card/60 to-transparent">
                    <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl border border-primary/10">
                        <Bell className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 leading-tight">
                        {t('app.feature3')}
                    </h3>
                    <p className="text-muted-foreground/80 leading-relaxed font-bold text-sm">
                        {t('app.feature3Desc')}
                    </p>
                </div>
            </div>
        </div>
    </section>
  );
}
