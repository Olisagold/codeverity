export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'codeverity-theme';
export const DEFAULT_THEME: Theme = 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Inlined in <head> so the saved theme is on <html> before first paint (no flash of the wrong theme).
 * Kept dependency-free and wrapped in try/catch: storage can throw in private windows.
 */
export const themeInitScript = `(function(){var t='${DEFAULT_THEME}';try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s==='light'||s==='dark')t=s;}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;
