'use client';

import { useTranslation } from '@/lib/i18n';

export type TimeRange = 'month' | '3months' | 'year' | 'all';

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

  const options: { range: TimeRange; label: string }[] = [
    { range: 'month',   label: t('app.timeRangeMonth') },
    { range: '3months', label: t('app.timeRange3Months') },
    { range: 'year',    label: t('app.timeRangeYear') },
    { range: 'all',     label: t('app.timeRangeAll') },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map(({ range, label }) => {
        const active = value === range;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={`shrink-0 h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
              active
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                : 'bg-secondary/50 border-primary/10 text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
