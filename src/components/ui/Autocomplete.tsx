'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ItemSuggestion {
  id: number;
  name: string;
  categoryName: string | null;
}

interface AutocompleteProps {
  name: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  suggestions: ItemSuggestion[];
  onSelect?: (item: ItemSuggestion) => void;
  onBlur?: (val: string) => void;
}

export default function SmartAutocomplete({
  name,
  value: initialValue = '',
  placeholder,
  required,
  suggestions,
  onSelect,
  onBlur,
}: AutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? suggestions.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : suggestions.slice(0, 8);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: ItemSuggestion) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelect?.(item);
    onBlur?.(item.name);
  };

  return (
    <div ref={wrapperRef} className="relative group">
      <div className="relative">
        <input
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
            const val = e.target.value.trim();
            setQuery(val);
            onBlur?.(val);
          }}
          className="input-premium"
        />
        {suggestions.length > 0 && (
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg) translateY(50%)' : 'rotate(0) translateY(-50%)' }}
          >
            <ChevronDown size={14} strokeWidth={3} />
          </div>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 glass shadow-2xl rounded-2xl overflow-hidden z-200 animate-in fade-in slide-in-from-top-2 duration-300 border border-primary/10">
          <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  {item.categoryName && (
                    <p className="text-[11px] text-muted-foreground truncate">{item.categoryName}</p>
                  )}
                </div>
                {item.name === query && <Check size={16} className="text-primary shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
