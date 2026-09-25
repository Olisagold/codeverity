'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthNotice } from '@/components/auth/AuthNotice';
import { PasswordField } from '@/components/ui/PasswordField';

type Status = 'idle' | 'loading' | 'success' | 'invalid';

interface Errors {
  password?: string;
  confirm?: string;
}

const LINK_CLASS =
  'text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const PRIMARY_BUTTON_CLASS =
  'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(token ? 'idle' : 'invalid');

  async function submitReset() {
    setStatus('loading');
    setFormError(null);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (response.status === 400 || response.status === 404) {
        setStatus('invalid');
        return;
      }
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
    const nextErrors: Errors = {};
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (confirm !== password) nextErrors.confirm = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void submitReset();
  }

  const signInFooter = (
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
        title="Choose a new password"
        subtitle="Your account is secured with the new password"
        footer={
          <>
            Need help?{' '}
            <Link href="/docs/authentication" className={LINK_CLASS}>
              Read the docs
            </Link>
          </>
        }
      >
        <AuthNotice
          tone="success"
          title="Password updated"
          action={
            <Link href="/login" className={PRIMARY_BUTTON_CLASS}>
              Continue to sign in
            </Link>
          }
        >
          <p>Your password has been changed successfully.</p>
          <p>Sign in with your new password to continue.</p>
        </AuthNotice>
      </AuthLayout>
    );
  }

  if (status === 'invalid') {
    return (
      <AuthLayout
        title="Choose a new password"
        subtitle="Reset links work once and expire after 30 minutes"
        footer={signInFooter}
      >
        <AuthNotice
          tone="error"
          title={token ? 'This link has expired' : 'This link is incomplete'}
          action={
            <Link href="/forgot-password" className={PRIMARY_BUTTON_CLASS}>
              Request a new link
            </Link>
          }
        >
          {token ? (
            <>
              <p>This reset link is invalid, has already been used, or has expired.</p>
              <p>Request a new one and we&apos;ll email it to you right away.</p>
            </>
          ) : (
            <>
              <p>This reset link is missing its token.</p>
              <p>Open the link from your email again, or request a new one.</p>
            </>
          )}
        </AuthNotice>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter a new password for your account"
      footer={signInFooter}
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

        {formError ? (
          <p className="text-center text-[13px] text-[#EF4444]" role="alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" disabled={status !== 'idle'} className={PRIMARY_BUTTON_CLASS}>
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
