'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthNotice } from '@/components/auth/AuthNotice';
import { TextField } from '@/components/ui/TextField';

type Status = 'idle' | 'loading' | 'success';

const LINK_CLASS =
  'text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  async function requestLink() {
    setStatus('loading');
    setFormError(null);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setFormError(typeof data?.detail === 'string' ? data.detail : 'Something went wrong. Try again.');
        setStatus('idle');
        return;
      }
      setStatus('success');
    } catch {
      setFormError('Something went wrong. Try again.');
      setStatus('idle');
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    void requestLink();
  }

  const footer = (
    <>
      Remember your password?{' '}
      <Link href="/login" className={LINK_CLASS}>
        Sign in
      </Link>
    </>
  );

  if (status === 'success') {
    return (
      <AuthLayout
        title="Reset your password"
        subtitle="Enter your email and we'll send you a reset link"
        footer={footer}
      >
        <AuthNotice tone="success" title="Check your email">
          <p>We&apos;ve sent a password reset link to your email address.</p>
          <p>Click the link to reset your password.</p>
          <p className="mt-6 text-[13.5px] text-faint">
            Didn&apos;t get it? Check your spam folder or{' '}
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="text-muted underline-offset-4 transition-colors duration-150 ease-out hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              try another email
            </button>
            .
          </p>
        </AuthNotice>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={footer}
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

        {formError ? (
          <p className="text-center text-[13px] text-[#EF4444]" role="alert">
            {formError}
          </p>
        ) : null}

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
