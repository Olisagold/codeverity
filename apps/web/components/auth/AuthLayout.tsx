import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { AuthAside } from './AuthAside';

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen w-full bg-base font-sans text-white lg:grid-cols-[1fr_minmax(420px,44%)]">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="font-mono text-[13px] font-medium uppercase tracking-[0.2em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Codeverity
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[440px]">
            <h1 className="text-[28px] font-medium leading-tight tracking-[-0.02em] text-white">{title}</h1>
            <p className="mt-2 text-[14.5px] text-muted">{subtitle}</p>
            <div className="mt-9">{children}</div>
            <div className="mt-8 text-center text-[13.5px] text-muted">{footer}</div>
          </div>
        </main>

        <footer className="px-6 py-6 sm:px-10">
          <p className="text-center font-mono text-[11px] text-faint lg:text-left">© 2026 Codeverity</p>
        </footer>
      </div>

      <AuthAside />
    </div>
  );
}
