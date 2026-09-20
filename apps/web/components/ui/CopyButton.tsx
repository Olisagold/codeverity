'use client';

import React, { useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  label?: string;
  /** Render just the icon (label stays as the accessible name). */
  iconOnly?: boolean;
}

export function CopyButton({ value, label = 'Copy', iconOnly = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {copied ? (
        <CheckIcon aria-hidden="true" className={iconOnly ? 'h-4 w-4 text-ok' : 'h-3.5 w-3.5 text-ok'} />
      ) : (
        <CopyIcon aria-hidden="true" className={iconOnly ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      )}
      {iconOnly ? null : copied ? 'Copied' : label}
    </button>
  );
}
