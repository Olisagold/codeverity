'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontalIcon } from 'lucide-react';

export interface RowMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
}

const MENU_WIDTH = 160;
const GAP = 4;

/**
 * Row actions menu. The menu renders in a portal with fixed positioning so it
 * isn't clipped by scrolling or rounded table containers, and it opens upward
 * when there isn't room below the button.
 */
export function RowMenu({ items }: { items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    function place() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? items.length * 32 + 8;
      const fitsBelow = rect.bottom + GAP + menuHeight <= window.innerHeight - 8;
      const top = fitsBelow ? rect.bottom + GAP : rect.top - GAP - menuHeight;
      const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
      setPosition({ top, left });
    }
    place();
    // Re-measure once the menu has rendered with its real height.
    const frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function close() {
      setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <div className="flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Actions"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="rounded-md p-1.5 text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <MoreHorizontalIcon aria-hidden="true" className="h-4 w-4" />
      </button>

      {open
        ? createPortal(
            <ul
              ref={menuRef}
              role="menu"
              onClick={(event) => event.stopPropagation()}
              style={{
                position: 'fixed',
                top: position?.top ?? -9999,
                left: position?.left ?? -9999,
                width: MENU_WIDTH,
                visibility: position ? 'visible' : 'hidden',
              }}
              className="z-50 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              {items.map((item) => (
                <li key={item.label} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpen(false);
                      item.onSelect();
                    }}
                    className={`block w-full px-3 py-1.5 text-left text-[13px] transition-colors duration-150 ease-out hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                      item.danger ? 'text-[#EF4444]' : 'text-muted hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  );
}
