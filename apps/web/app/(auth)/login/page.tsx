'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { TextField } from '@/components/ui/TextField';
import { PasswordField } from '@/components/ui/PasswordField';

type Status = 'idle' | 'loading' | 'success';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<Status>('idle');
  const router = useRouter();

  useEffect(() => {
    if (status !== 'success') return;
    const timer = window.setTimeout(() => router.push('/dashboard'), 700);
    return () => window.clearTimeout(timer);
  }, [status, router]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Passwords are at least 8 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    window.setTimeout(() => setStatus('success'), 900);
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Sign up
          </Link>
        </>
      }
    >
      <SocialButtons action="Continue" />

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line-soft" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">or continue with email</span>
        <span className="h-px flex-1 bg-line-soft" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(value) => setEmail(value)}
          placeholder="name@yourcompany.com"
          autoComplete="email"
          error={errors.email}
        />

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(value) => setPassword(value)}
          error={errors.password}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-[13px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Forgot password?
            </Link>
          }
        />

        <button
          type="submit"
          disabled={status !== 'idle'}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {status === 'loading' ? (
            <>
              <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2Icon aria-hidden="true" className="h-4 w-4" />
              Signed in
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <div aria-live="polite" className="min-h-[18px]">
          {status === 'success' ? (
            <p className="text-center text-[13px] text-ok">Redirecting to your dashboard…</p>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  );
}
