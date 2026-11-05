'use client';

import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'light' ? 'Switch to dark theme' : theme === 'dark' ? 'Switch to light theme' : 'Toggle theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 text-faint transition-colors duration-150 ease-out hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      {/* Both icons render; CSS picks one from `data-theme`, so the right icon shows before hydration. */}
      <SunIcon aria-hidden="true" className="theme-dark-only h-4 w-4" />
      <MoonIcon aria-hidden="true" className="theme-light-only h-4 w-4" />
    </button>
  );
}
