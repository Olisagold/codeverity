import React from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-base font-sans text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
