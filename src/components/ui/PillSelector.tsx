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
                className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
            >
                {options.map((option) => {
                    const isActive = value === option;
                    return (
                        <button
                            key={option}
                            type="button"
                            data-active={isActive}
                            onClick={() => onChange(option)}
                            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                                isActive
                                    ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white dark:bg-slate-800 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
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
