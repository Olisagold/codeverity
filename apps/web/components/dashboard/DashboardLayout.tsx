'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-base font-sans text-white">
      <DashboardTopBar mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((value) => !value)} />

      {mobileOpen ? (
        <div className="border-b border-line-soft px-4 lg:hidden">
          <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      ) : null}

      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-line-soft pl-4 lg:block xl:w-60 xl:pl-6">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <DashboardSidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
