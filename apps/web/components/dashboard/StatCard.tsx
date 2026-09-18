import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: { direction: 'up' | 'down'; value: string };
}

export function StatCard({ label, value, detail, trend }: StatCardProps) {
  const TrendIcon = trend?.direction === 'down' ? ArrowDownRightIcon : ArrowUpRightIcon;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-[12.5px] text-faint">{label}</p>
      <p className="mt-3 text-[26px] font-medium leading-none tracking-[-0.02em] text-white">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {trend ? (
          <span
            className={`flex items-center gap-1 font-mono text-[11.5px] ${
              trend.direction === 'down' ? 'text-amber' : 'text-ok'
            }`}
          >
            <TrendIcon aria-hidden="true" className="h-3 w-3" />
            {trend.value}
          </span>
        ) : null}
        {detail ? <span className="font-mono text-[11.5px] text-faint">{detail}</span> : null}
      </div>
    </div>
  );
}
