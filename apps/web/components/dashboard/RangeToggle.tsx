import React from 'react';

export type Range = '7d' | '30d' | '90d';

const options: { value: Range; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

interface RangeToggleProps {
  value: Range;
  onChange: (value: Range) => void;
}

export function RangeToggle({ value, onChange }: RangeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2.5 py-1 text-[12.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            value === option.value ? 'bg-surface-2 text-white' : 'text-faint hover:text-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
