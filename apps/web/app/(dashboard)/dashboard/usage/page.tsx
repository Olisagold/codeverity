'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RangeToggle, type Range } from '@/components/dashboard/RangeToggle';
import { apiKeys, seriesForRange } from '@/lib/dashboard';

export default function UsagePage() {
  const [range, setRange] = useState<Range>('30d');
  const points = seriesForRange(range);

  return (
    <>
      <PageHeader title="Usage" description="Monitor API requests and assessment activity." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="API requests" value="12,483" trend={{ direction: 'up', value: '8.1%' }} />
        <StatCard label="Assessments" value="3,241" detail="this period" />
        <StatCard label="Successful" value="3,102" detail="95.7%" />
        <StatCard label="Failed" value="139" detail="4.3%" />
      </div>

      <section className="mt-6 rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-medium text-white">Requests</h2>
          <RangeToggle value={range} onChange={setRange} />
        </div>
        <div className="px-5 py-5">
          <ActivityChart points={points} metric="requests" />
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14.5px] font-medium text-white">Usage by API key</h2>
        </div>
        <ul className="divide-y divide-line-soft">
          {apiKeys.map((key) => (
            <li key={key.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-[13.5px] text-white">{key.name}</p>
                <p className="mt-0.5 font-mono text-[11.5px] text-faint">{key.masked}</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-mono text-[13px] text-white">{key.requests.toLocaleString()}</p>
                  <p className="font-mono text-[11px] text-faint">requests</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[13px] text-white">{key.assessments.toLocaleString()}</p>
                  <p className="font-mono text-[11px] text-faint">assessments</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
