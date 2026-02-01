'use client';

import { useRef, useEffect } from 'react';

interface PillSelectorProps {
    name?: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export default function PillSelector({ name, options, value, onChange }: PillSelectorProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll active item into view on mount
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeEl = scrollContainerRef.current.querySelector<HTMLButtonElement>(`button[data-active="true"]`);
            if (activeEl) {
                // simple scroll into view center
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, []);

    return (
        <div className="relative w-full overflow-hidden">
            {/* Hidden Input for Form Data if needed */}
            {name && <input type="hidden" name={name} value={value} />}

            <div 
                ref={scrollContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2"
            >
                {options.map((option) => {
                    const isActive = value === option;
                    return (
                        <button
                            key={option}
                            type="button"
                            data-active={isActive}
                            onClick={() => onChange(option)}
                            className={`shrink-0 h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 border ${
                                isActive
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                    : 'bg-secondary/20 border-primary/5 text-muted-foreground/60 hover:bg-secondary/40 hover:text-foreground'
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            {/* Gradient fade for scroll indication (optional, tricky with pure css, skipping for cleaner look) */}
        </div>
    );
}
