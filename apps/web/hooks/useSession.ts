'use client';

import { useEffect, useState } from 'react';
import { getSession } from '@/lib/api/dashboard';
import type { Session } from '@/types/api';

// Shared across the sidebar, top bar, and settings so the session loads once.
let cached: Promise<Session> | null = null;
const listeners = new Set<(session: Session) => void>();

export function setSession(session: Session) {
  cached = Promise.resolve(session);
  listeners.forEach((listener) => listener(session));
}

export function useSession() {
  const [session, setState] = useState<Session | null>(null);

  useEffect(() => {
    cached ??= getSession();
    cached.then(setState).catch(() => {
      cached = null;
    });
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return session;
}
