import { Entry } from '@/app/app/actions';
import { Edit2, Trash2, TrendingUp, ArrowDownRight, ShoppingBag } from 'lucide-react';

interface EntryCardProps {
    entry: Entry;
    onClickEdit: (entry: Entry) => void;
    onClickDelete: (entry: Entry) => void;
    onClickTimeline: (item: string) => void;
}

export default function EntryCard({ entry, onClickEdit, onClickDelete, onClickTimeline }: EntryCardProps) {
    const isConsume = entry.type === 'consume';

    return (
        <div className={`glass-card p-5 rounded-3xl flex flex-col gap-4 group relative overflow-hidden transition-all hover:shadow-lg ${
            isConsume ? 'border-l-4 border-l-orange-500/50' : 'border-l-4 border-l-emerald-500/50'
        }`}>
            {/* Top Row: Icon, Title & Value */}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1 pr-2">
                     <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                         isConsume ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                     }`}>
                         {isConsume ? <ArrowDownRight size={20} strokeWidth={2.5} /> : <ShoppingBag size={20} strokeWidth={2.5} />}
                     </div>
                     <div>
                        <h3 className="font-heading font-bold text-lg text-foreground leading-tight line-clamp-1">{entry.item}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                     </div>
                </div>

                <div className={`text-lg font-black px-3 py-1 rounded-xl ${
                    isConsume ? 'text-orange-600 bg-orange-500/5 dark:text-orange-400' : 'text-emerald-600 bg-emerald-500/5 dark:text-emerald-400'
                }`}>
                    {isConsume ? (
                        <span>-{entry.quantity} {entry.unit}</span>
                    ) : (
                        <span>฿{entry.price.toLocaleString()}</span>
                    )}
                </div>
            </div>

            {/* Note Section (if any) */}
            {entry.note && (
                <p className="text-xs text-muted-foreground line-clamp-2 bg-secondary/50 p-2 rounded-lg -mt-2">
                    &quot;{entry.note}&quot;
                </p>
            )}

            {/* Bottom Row: Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                     {isConsume ? 'Stock Usage' : 'Purchase'}
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClickTimeline(entry.item); }}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-90"
                        title="View History"
                    >
                        <TrendingUp size={16} />
                    </button>
                    {!isConsume && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClickEdit(entry); }}
                            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-90"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClickDelete(entry); }}
                        className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors active:scale-90"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
