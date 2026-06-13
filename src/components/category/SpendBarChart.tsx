'use client';

interface DataPoint {
  month: string; // YYYY-MM
  total: number;
}

interface Props {
  data: DataPoint[];
}

function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
}

export default function SpendBarChart({ data }: Props) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.total));

  return (
    <div className="flex items-end gap-2 h-24" role="img" aria-label="Monthly spend chart">
      {data.map((d) => {
        const heightPct = max > 0 ? `${(d.total / max) * 100}%` : '0%';
        return (
          <div key={d.month} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
              <div
                data-bar
                className="w-full rounded-t-lg bg-primary/70 transition-all duration-500"
                style={{ height: heightPct }}
              />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate w-full text-center">
              {formatMonth(d.month)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
