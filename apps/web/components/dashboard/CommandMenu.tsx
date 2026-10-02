'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from 'lucide-react';

const pages = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'API Keys', href: '/dashboard/api-keys' },
  { label: 'Assessments', href: '/dashboard/assessments' },
  { label: 'Webhooks', href: '/dashboard/webhooks' },
  { label: 'Usage', href: '/dashboard/usage' },
  { label: 'Logs', href: '/dashboard/logs' },
  { label: 'Settings', href: '/dashboard/settings' },
  { label: 'Organization settings', href: '/dashboard/settings/organization' },
  { label: 'Security settings', href: '/dashboard/settings/security' },
  { label: 'Documentation', href: '/docs/introduction' },
];

/** ⌘K menu: jump to a page, or open an assessment or request by pasting its ID. */
export function CommandMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const router = useRouter();

  const results = useMemo(() => {
    const value = text.trim();
    const items: { label: string; href: string }[] = [];
    if (/^asm_/i.test(value)) items.push({ label: `Open assessment ${value}`, href: `/dashboard/assessments/${value}` });
    if (/^req_/i.test(value)) items.push({ label: `Open request ${value}`, href: `/dashboard/logs/${value}` });
    const lower = value.toLowerCase();
    return [...items, ...pages.filter((page) => page.label.toLowerCase().includes(lower))];
  }, [text]);

  useEffect(() => {
    if (open) {
      setText('');
      setActive(0);
    }
  }, [open]);

  if (!open) return null;

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') onClose();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter' && results[active]) go(results[active].href);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/70 px-4 pt-[14vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface"
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <SearchIcon aria-hidden="true" className="h-4 w-4 text-faint" />
          <input
            autoFocus
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Go to a page, or paste an asm_ or req_ ID…"
            aria-label="Search"
            className="h-12 w-full bg-transparent text-[13.5px] text-white placeholder:text-faint focus:outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-[13px] text-faint">No matches.</li>
          ) : (
            results.map((result, index) => (
              <li key={result.href}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(result.href)}
                  className={`block w-full px-4 py-2 text-left text-[13px] ${
                    index === active ? 'bg-surface-2 text-white' : 'text-muted'
                  }`}
                >
                  {result.label}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
