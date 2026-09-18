'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2Icon, Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { SocialButtons } from '@/components/auth/SocialButtons';
import { TextField } from '@/components/ui/TextField';
import { PasswordField } from '@/components/ui/PasswordField';

type Status = 'idle' | 'loading' | 'success';

interface Errors {
  name?: string;
  organization?: string;
  email?: string;
  password?: string;
  terms?: string;
}

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  function handleSubmit(event: React.FormEvent) {
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
    window.setTimeout(() => setStatus('success'), 900);
  }

  if (status === 'success') {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a verification link to ${email}. Confirm it to generate your test API key.`}
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
            Account created
          </p>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Once verified, your organization receives a test key in the format{' '}
            <span className="font-mono text-[13px] text-white">sk_test_···</span> with unlimited development
            assessments.
          </p>
        </div>
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
