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
            <header className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={24} />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('trends.title')}
                    </h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('app.subtitle')}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
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
                            {totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100/60">
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-white/60 rounded-full w-[70%]" />
                            </div>
                            <span>70%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Items Section */}
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <PieChart size={20} className="text-indigo-500" />
                        {t('trends.topItems')}
                    </h2>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                        {entries.length} {t('app.itemsCount')}
                    </span>
                </div>

                {topItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <ShoppingBag size={48} className="mb-3 opacity-20" />
                        <p>{t('app.addFirst')}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {topItems.map((item, index) => (
                            <div key={item.name} className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                                        {item.name}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        ฿{item.cost.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${(item.cost / maxCost) * 100}%`,
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Extra Info/Call to Action */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Optimization Tips</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        Looks like you&apos;re spending most on <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{topItems[0]?.name || '...'}</span>. Consider buying larger packs to save on unit cost.
                    </p>
                </div>
            </div>
        </div>
    );
}
