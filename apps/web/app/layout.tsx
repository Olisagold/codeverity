import type { Metadata } from 'next';
import { themeInitScript } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'Codeverity',
  description: 'Codeverity — automated code assessment infrastructure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-theme` is set by the inline script before hydration, so React must not warn about it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
