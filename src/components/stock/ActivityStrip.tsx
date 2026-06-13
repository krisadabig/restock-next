'use client';

interface ActivityItem {
  id: number;
  name: string;
}

interface Props {
  partnerName: string;
  items: ActivityItem[];
  lastActivityAt: Date;
  onChipTap: (itemId: number) => void;
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  return 'yesterday';
}

export default function ActivityStrip({ partnerName, items, lastActivityAt, onChipTap }: Props) {
  if (items.length === 0) return null;

  return (
    <div data-testid="activity-strip" className="px-5 py-3 space-y-2">
      <p data-testid="activity-header" className="text-xs text-muted-foreground font-medium">
        <span className="font-semibold text-foreground">{partnerName}</span>
        {' logged '}
        <span className="font-semibold text-foreground">{items.length}</span>
        {` items · ${relativeTime(lastActivityAt)}`}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {items.map((item) => (
          <button
            key={item.id}
            data-testid="activity-chip"
            type="button"
            onClick={() => onChipTap(item.id)}
            className="shrink-0 h-8 px-3.5 rounded-xl text-xs font-medium bg-secondary/60 border border-border/50 text-foreground hover:bg-secondary/80 transition-colors"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
