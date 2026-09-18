'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordField } from '@/components/ui/PasswordField';

type Status = 'idle' | 'loading' | 'success';

interface Errors {
  password?: string;
  confirm?: string;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (confirm !== password) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 900);
  }

  if (status === 'success') {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been changed successfully."
        footer={
          <Link
            href="/login"
            className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Continue to sign in
          </Link>
        }
      >
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
            <CheckCircle2Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Password reset
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Sign in with your new password to access your dashboard.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={
        token
          ? 'Enter a new password for your account.'
          : 'This reset link is missing a token. Request a new one if the link has expired.'
      }
      footer={
        <>
          Remembered it?{' '}
          <Link
            href="/login"
            className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <PasswordField
          id="password"
          label="New password"
          value={password}
          onChange={(value) => setPassword(value)}
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters."
        />

        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={(value) => setConfirm(value)}
          autoComplete="new-password"
          error={errors.confirm}
        />

        <button
          type="submit"
          disabled={status !== 'idle'}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {status === 'loading' ? (
            <>
              <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
              Updating password
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
