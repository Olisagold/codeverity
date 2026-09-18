import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-base px-6 py-12 font-sans text-white">
      <div className="w-full max-w-[440px]">
        <h1 className="text-[28px] font-medium leading-tight tracking-[-0.02em] text-white">{title}</h1>
        <p className="mt-2 text-[14.5px] text-muted">{subtitle}</p>
        <div className="mt-9">{children}</div>
        <div className="mt-8 text-center text-[13.5px] text-muted">{footer}</div>
      </div>
    </main>
  );
}
