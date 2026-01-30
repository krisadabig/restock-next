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
                    className="w-full p-4 bg-gray-100 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all dark:text-white font-bold"
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
                 <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                     <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                         {filteredSuggestions.map(s => (
                             <button
                                 key={s}
                                 type="button"
                                 onClick={() => handleSelect(s)}
                                 className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors flex items-center justify-between group"
                             >
                                 {s}
                                 {s === query && <Check size={14} className="text-indigo-500" />}
                             </button>
                         ))}
                     </div>
                 </div>
             )}
        </div>
    );
}
