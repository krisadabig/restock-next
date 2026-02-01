'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface AutocompleteProps {
    name: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    suggestions: string[];
    onBlur?: (val: string) => void;
}

export default function SmartAutocomplete({ 
    name, 
    value: initialValue = '', 
    placeholder, 
    required, 
    suggestions,
    onBlur
}: AutocompleteProps) {
    const [query, setQuery] = useState(initialValue);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredSuggestions = query 
        ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()) && s !== query)
        : suggestions.slice(0, 5); // Show top 5 recent/initial if empty? Or show nothing? Let's show top 5.

    // Handle Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
        setQuery(val);
        setIsOpen(false);
        // Trigger blur logic immediately
        if (onBlur) onBlur(val);
    };

    return (
        <div ref={wrapperRef} className="relative group">
             {/* Input */}
             <div className="relative">
                <input 
                    ref={inputRef}
                    name={name}
                    type="text"
                    required={required}
                    placeholder={placeholder}
                    value={query}
                    autoComplete="off"
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={(e) => {
                         // Small delay to allow click on dropdown to fire first
                         // But we handle click outside separately. 
                         // Just handle the trim here.
                         const val = e.target.value.trim();
                         setQuery(val);
                         if (onBlur) onBlur(val);
                    }}
                    className="input-premium"
                />
                 {/* Chevron Indicator */}
                 {suggestions.length > 0 && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg) translateY(50%)' : 'rotate(0) translateY(-50%)' }}>
                         <ChevronDown size={14} strokeWidth={3} />
                     </div>
                 )}
             </div>

             {/* Dropdown */}
             {isOpen && filteredSuggestions.length > 0 && (
                 <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 glass shadow-2xl rounded-2xl overflow-hidden z-200 animate-in fade-in slide-in-from-top-2 duration-300 border border-primary/10">
                     <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                         {filteredSuggestions.map(s => (
                             <button
                                 key={s}
                                 type="button"
                                 onClick={() => handleSelect(s)}
                                 className="w-full h-12 text-left px-4 rounded-xl hover:bg-primary/10 hover:text-primary font-bold text-sm transition-all flex items-center justify-between group active:scale-[0.98]"
                             >
                                 {s}
                                 {s === query && <Check size={16} className="text-primary" />}
                             </button>
                         ))}
                     </div>
                 </div>
             )}
        </div>
    );
}
