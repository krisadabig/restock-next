'use client';

import { useTranslation } from '@/lib/i18n';
import { TrendingUp, PieChart, ArrowUpRight, CreditCard, ShoppingBag } from 'lucide-react';

interface Entry {
	id: number;
	item: string;
	price: number;
	date: string;
	note: string | null;
}

export default function TrendsClient({ entries }: { entries: Entry[] }) {
    const { t } = useTranslation();

    // Calculate total spending
    const totalSpending = entries.reduce((acc, entry) => acc + entry.price, 0);

    // Month-over-Month Calculation
    const now = new Date();
    const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);

    const currentMonthSpending = entries
        .filter(e => e.date.startsWith(currentMonthStr))
        .reduce((acc, e) => acc + e.price, 0);
    
    const prevMonthSpending = entries
        .filter(e => e.date.startsWith(prevMonthStr))
        .reduce((acc, e) => acc + e.price, 0);

    const momChange = prevMonthSpending === 0 
        ? 0 
        : ((currentMonthSpending - prevMonthSpending) / prevMonthSpending) * 100;

    // Group by item and sum the price
    const itemSpendingMap = entries.reduce((acc, entry) => {
        acc[entry.item] = (acc[entry.item] || 0) + entry.price;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by value
    const topItems = Object.entries(itemSpendingMap)
        .map(([name, cost]) => ({ name, cost }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5); // Top 5

    const maxCost = topItems.length > 0 ? topItems[0].cost : 1;

    return (
        <div className="p-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 text-indigo-500">
                    <TrendingUp size={28} strokeWidth={3} />
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {t('trends.title')}
                    </h1>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-9">
                    {t('app.subtitle')}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-indigo-600 to-violet-700 p-6 rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 text-white overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-indigo-100/80 font-medium text-sm flex items-center gap-1.5">
                                <CreditCard size={14} />
                                {t('trends.totalSpending')}
                            </span>
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                        <div className="text-4xl font-black tracking-tight flex items-baseline gap-1">
                            <span className="text-2xl font-medium opacity-80">฿</span>
                            {totalSpending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center gap-1.5">
                                <TrendingUp size={14} />
                                Month-over-Month
                            </span>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
                            {momChange > 0 ? '+' : ''}{momChange.toFixed(1)}%
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                vs Last Month
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
                            ฿{currentMonthSpending.toLocaleString()} this month
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Items Section */}
            <section className="glass rounded-3xl p-6 transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <PieChart size={24} className="text-indigo-500" />
                        {t('trends.topItems')}
                    </h2>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
                        {entries.length} {t('app.itemsCount')}
                    </span>
                </div>

                {topItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <ShoppingBag size={56} className="mb-4 opacity-10" />
                        <p className="font-medium">{t('app.addFirst')}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {topItems.map((item, index) => (
                            <div key={item.name} className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {item.name}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400 font-black">
                                        ฿{item.cost.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden p-0.5">
                                    <div 
                                        className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/20"
                                        style={{ 
                                            width: `${(item.cost / maxCost) * 100}%`,
                                            transitionDelay: `${index * 150}ms`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Extra Info/Call to Action */}
            <div className="glass-premium p-6 rounded-3xl flex items-start gap-4 mt-4">
                <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-500">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-1">Smart Savings</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Looks like you&apos;re spending most on <span className="text-indigo-500 font-black">{topItems[0]?.name || '...'}</span>. Consider buying larger packs to save on unit cost.
                    </p>
                </div>
            </div>
        </div>
    );
}
