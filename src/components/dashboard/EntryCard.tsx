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
        <div className={`glass-card p-6 rounded-[2rem] flex flex-col gap-5 group relative overflow-hidden transition-all hover:shadow-2xl ${
            isConsume ? 'border-l-4 border-l-orange-500/30' : 'border-l-4 border-l-emerald-500/30'
        }`}>
            {/* Top Row: Icon, Title & Value */}
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-4 flex-1 pr-2">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                         isConsume ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
                     }`}>
                         {isConsume ? <ArrowDownRight size={24} strokeWidth={2.5} /> : <ShoppingBag size={24} strokeWidth={2.5} />}
                     </div>
                     <div className="min-w-0">
                        <h3 className="font-bold text-lg text-foreground leading-tight truncate">{entry.item}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                     </div>
                </div>

                <div className={`text-xl font-bold px-4 py-2 rounded-2xl shadow-inner ${
                    isConsume ? 'text-orange-500 bg-orange-500/5' : 'text-emerald-500 bg-emerald-500/5'
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
                <div className="bg-secondary/30 p-4 rounded-2xl border border-primary/5">
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                        &quot;{entry.note}&quot;
                    </p>
                </div>
            )}

            {/* Bottom Row: Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-primary/5">
                <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
                     {isConsume ? 'Stock Usage' : 'Purchase'}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClickTimeline(entry.item); }}
                        className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                        title="View History"
                    >
                        <TrendingUp size={18} />
                    </button>
                    {!isConsume && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClickEdit(entry); }}
                            className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                            title="Edit"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClickDelete(entry); }}
                        className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
