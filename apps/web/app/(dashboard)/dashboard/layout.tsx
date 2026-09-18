import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function DashboardSegmentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
