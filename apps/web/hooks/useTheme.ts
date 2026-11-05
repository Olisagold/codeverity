'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, type Theme } from '@/lib/theme';

// The source of truth is the `data-theme` attribute on <html>, set before paint by `themeInitScript`.
function readTheme(): Theme {
  const value = document.documentElement.getAttribute('data-theme');
  return isTheme(value) ? value : DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Suspend CSS transitions for one frame so every surface switches at once instead of fading unevenly.
  root.classList.add('theme-switching');
  root.setAttribute('data-theme', theme);
  void window.getComputedStyle(document.body).opacity;
  window.setTimeout(() => root.classList.remove('theme-switching'), 1);
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Keep other open tabs in step with a change made here.
  function handleStorage(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue) && event.newValue !== readTheme()) {
      applyTheme(event.newValue);
    }
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener('storage', handleStorage);
  };
}

/** `theme` is null during server render and hydration, then the active theme. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private window, blocked site data); the choice still applies to this page.
    }
  }, []);

  const toggleTheme = useCallback(() => setTheme(readTheme() === 'light' ? 'dark' : 'light'), [setTheme]);

  return { theme, setTheme, toggleTheme };
}
