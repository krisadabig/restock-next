import { Search, Calendar, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface DashboardFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterMonth: string;
    setFilterMonth: (val: string) => void;
    months: string[];
}

export default function DashboardFilters({ 
    searchQuery, 
    setSearchQuery, 
    filterMonth, 
    setFilterMonth, 
    months 
}: DashboardFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className="px-6 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder={t('app.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setSearchQuery(searchQuery.trim())} 
                    className="w-full pl-14 pr-6 h-14 bg-secondary/30 glass border border-primary/5 focus:border-primary/30 focus:bg-secondary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all placeholder:text-muted-foreground/30 font-semibold"
                />
            </div>
            <div className="relative group min-w-45">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary pointer-events-none transition-colors" size={20} />
                <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="appearance-none w-full h-14 pl-14 pr-12 bg-secondary/30 glass border border-primary/5 focus:border-primary/30 focus:bg-secondary/50 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all cursor-pointer font-bold"
                >
                    <option value="all">{t('app.allTime')}</option>
                    {months.map(m => (
                        <option key={m} value={m}>
                            {new Date(m + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
            </div>
        </div>
    );
}
