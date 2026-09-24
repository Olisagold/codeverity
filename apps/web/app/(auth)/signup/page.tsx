'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { TextField } from '@/components/ui/TextField';
import { PasswordField } from '@/components/ui/PasswordField';

type Step = 'form' | 'otp';
type Status = 'idle' | 'loading' | 'success';

interface Errors {
  name?: string;
  organization?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (name.trim().length < 2) nextErrors.name = 'Enter your full name.';
    if (organization.trim().length < 2) nextErrors.organization = 'Enter your organization or platform name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid work email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!accepted) nextErrors.terms = 'Accept the terms to create an account.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, organization, email, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrors({ email: data?.detail ?? 'Could not create your account. Try again.' });
        setStatus('idle');
        return;
      }
      setStatus('idle');
      setStep('otp');
    } catch {
      setErrors({ email: 'Something went wrong. Try again.' });
      setStatus('idle');
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setCodeError(undefined);
    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit code from your email.');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setCodeError(data?.detail ?? 'Invalid or expired code.');
        setStatus('idle');
        return;
      }
      setStatus('success');
      router.push('/dashboard');
    } catch {
      setCodeError('Something went wrong. Try again.');
      setStatus('idle');
    }
  }

  if (step === 'otp') {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a 6-digit code to ${email}.`}
        footer={
          <>
            Wrong address?{' '}
            <button
              type="button"
              onClick={() => setStep('form')}
              className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Use a different email
            </button>
          </>
        }
      >
        <form onSubmit={handleVerify} noValidate className="space-y-5">
          <TextField
            id="code"
            label="Verification code"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            autoComplete="one-time-code"
            error={codeError}
          />

          <button
            type="submit"
            disabled={status !== 'idle'}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {status === 'loading' ? (
              <>
                <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
                Verifying
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2Icon aria-hidden="true" className="h-4 w-4" />
                Verified
              </>
            ) : (
              'Verify email'
            )}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start integrating multi-model code assessment."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-white underline-offset-4 transition-colors duration-150 ease-out hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SocialButtons action="Sign up" />

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line-soft" />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">or sign up with email</span>
        <span className="h-px flex-1 bg-line-soft" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          id="name"
          label="Full name"
          value={name}
          onChange={(value) => setName(value)}
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={errors.name}
        />

        <TextField
          id="organization"
          label="Organization"
          value={organization}
          onChange={(value) => setOrganization(value)}
          placeholder="University, bootcamp, or platform"
          autoComplete="organization"
          error={errors.organization}
        />

        <TextField
          id="email"
          label="Work email"
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
          autoComplete="new-password"
          error={errors.password}
          hint="At least 8 characters."
        />

        <div>
          <label htmlFor="terms" className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
            <input
              id="terms"
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line-strong bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            />
            <span>
              I agree to the <span className="text-white">Terms of Service</span> and{' '}
              <span className="text-white">Privacy Policy</span>.
            </span>
          </label>
          {errors.terms ? (
            <p id="terms-error" className="mt-2 text-[12.5px] text-amber">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white text-[15px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted disabled:cursor-not-allowed disabled:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {status === 'loading' ? (
            <>
              <Loader2Icon aria-hidden="true" className="h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
