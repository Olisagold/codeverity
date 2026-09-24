import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // NOTE: naming a colour `base` makes `text-base` resolve to `color: #000` (black on black)
        // instead of the 16px font size. Use `text-[16px]` for that size; never `text-base`.
        base: '#000000',
        surface: '#050505',
        'surface-2': '#0A0A0A',
        line: '#27272A',
        'line-soft': '#18181B',
        'line-strong': '#3F3F46',
        muted: '#D4D4D8',
        faint: '#A1A1AA',
        accent: '#3B82F6',
        ok: '#22C55E',
        violet: '#8B5CF6',
        amber: '#F59E0B',
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
