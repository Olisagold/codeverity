'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SettingsTabs, SettingsCard } from '@/components/dashboard/SettingsTabs';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { setSession, useSession } from '@/hooks/useSession';
import { errorMessage } from '@/lib/api/client';
import { changePassword } from '@/lib/api/dashboard';

const inputClasses =
  'mt-2 h-11 w-full max-w-md rounded-lg border border-line bg-base px-3 text-[13.5px] text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

export default function SettingsSecurityPage() {
  const session = useSession();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const hasPassword = session?.user.has_password ?? true;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (next.length < 8) {
      setMessage({ text: 'Use at least 8 characters.', ok: false });
      return;
    }
    if (next !== confirm) {
      setMessage({ text: 'The new passwords do not match.', ok: false });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await changePassword({ current_password: hasPassword ? current : undefined, new_password: next });
      if (session && !hasPassword) setSession({ ...session, user: { ...session.user, has_password: true } });
      setCurrent('');
      setNext('');
      setConfirm('');
      setMessage({ text: hasPassword ? 'Password changed.' : 'Password set.', ok: true });
    } catch (error) {
      setMessage({ text: errorMessage(error, 'Could not update your password.'), ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <SettingsTabs />

      <SettingsCard title="Password">
        {!session ? (
          <Skeleton rows={3} />
        ) : (
          <form onSubmit={save} className="space-y-5">
            <p className="text-[13px] text-faint">
              {hasPassword
                ? 'Change the password you use to sign in with your email.'
                : 'You sign in with Google or GitHub. Set a password to also sign in with your email.'}
            </p>
            {hasPassword ? (
              <div>
                <label htmlFor="current-password" className="block text-[13px] font-medium text-white">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                  className={inputClasses}
                />
              </div>
            ) : null}
            <div>
              <label htmlFor="new-password" className="block text-[13px] font-medium text-white">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={next}
                onChange={(event) => setNext(event.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-[13px] font-medium text-white">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="flex items-center gap-3 border-t border-line pt-5">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
              >
                {saving ? 'Saving…' : hasPassword ? 'Change password' : 'Set password'}
              </button>
              <span aria-live="polite" className={`text-[12.5px] ${message?.ok ? 'text-ok' : 'text-amber'}`}>
                {message?.text ?? ''}
              </span>
            </div>
          </form>
        )}
      </SettingsCard>
    </>
  );
}
