import type { Config } from 'tailwindcss';

// Every colour is an RGB channel triplet defined in `app/globals.css` for both themes,
// so opacity modifiers (`border-ok/40`, `bg-accent/15`) keep working in light and dark.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // NOTE: naming a colour `base` makes `text-base` resolve to a colour (page background on page background)
        // instead of the 16px font size. Use `text-[16px]` for that size; never `text-base`.
        base: token('base'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        'line-soft': token('line-soft'),
        'line-strong': token('line-strong'),
        // Primary text and inverted fills. `on-fg` is text placed on an `fg` fill (primary buttons).
        // Use plain `white` only for text on a fixed-colour fill such as `bg-danger`.
        fg: token('fg'),
        'on-fg': token('on-fg'),
        muted: token('muted'),
        faint: token('faint'),
        accent: token('accent'),
        ok: token('ok'),
        violet: token('violet'),
        amber: token('amber'),
        danger: token('danger'),
        'danger-strong': token('danger-strong'),
        // Modal backdrop. The theme scales the opacity so `bg-scrim/80` stays readable on a light page.
        scrim: 'rgb(var(--c-scrim) / calc(<alpha-value> * var(--scrim-strength)))',
        // Mock window chrome in the marketing product shots.
        chrome: token('chrome'),
        'chrome-dot': token('chrome-dot'),
      },
      boxShadow: {
        menu: '0 8px 24px var(--shadow-menu)',
        window: '0 30px 80px -30px var(--shadow-window)',
        'window-strong': '0 30px 80px -30px var(--shadow-window-strong)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      maxWidth: {
        shell: '72rem',
      },
    },
  },
};

export default config;
