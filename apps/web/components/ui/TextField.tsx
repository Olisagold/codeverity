'use client';

import React from 'react';

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  trailing?: React.ReactNode;
  labelAction?: React.ReactNode;
  hint?: string;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  trailing,
  labelAction,
  hint,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13px] font-medium text-white">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative mt-2">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-14 w-full rounded-xl border bg-surface px-4 text-[15px] text-white placeholder:text-faint transition-colors duration-150 ease-out focus:outline-none focus:ring-1 ${
            error
              ? 'border-amber focus:border-amber focus:ring-amber'
              : 'border-line hover:border-line-strong focus:border-accent focus:ring-accent'
          } ${trailing ? 'pr-12' : ''}`}
        />
        {trailing ? <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div> : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[12.5px] text-amber">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[12.5px] text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
