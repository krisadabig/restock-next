import { Search, Calendar, ChevronDown } from 'lucide-react';

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
    return (
        <div className="px-6 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // Input Hygiene: Trim on blur but keep updating on change for responsiveness
                    onBlur={() => setSearchQuery(searchQuery.trim())} 
                    className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary focus:ring-0 rounded-2xl transition-all placeholder:text-muted-foreground/70"
                />
            </div>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="appearance-none pl-11 pr-10 py-3 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-secondary focus:ring-0 rounded-2xl transition-all cursor-pointer min-w-40"
                >
                    <option value="all">All Time</option>
                    {months.map(m => (
                        <option key={m} value={m}>
                            {new Date(m + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
        </div>
    );
}
