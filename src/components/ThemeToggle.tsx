'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 glass rounded-xl" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="glass p-2 rounded-xl transition-all hover:bg-white/10 active:scale-95 group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-12 transition-transform" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
      )}
    </button>
  );
}
