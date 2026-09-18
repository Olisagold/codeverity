'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { TextField } from '@/components/ui/TextField';

type Status = 'idle' | 'loading' | 'success';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>('idle');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 900);
  }

  if (status === 'success') {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a password reset link to ${email}.`}
        footer={
          <>
            Wrong address?{' '}
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Use a different email
            </button>
          </>
        }
      >
        <div className="rounded-xl border border-line bg-surface p-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
            <CheckCircle2Icon aria-hidden="true" className="h-3.5 w-3.5" />
            Reset link sent
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Follow the link in the email to choose a new password. The link expires in 30 minutes.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password."
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
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(value) => setEmail(value)}
          placeholder="name@yourcompany.com"
          autoComplete="email"
          error={error}
        />

        <button
          type="submit"
          disabled={status !== 'idle'}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {status === 'loading' ? (
            <>
              <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
              Sending link
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
