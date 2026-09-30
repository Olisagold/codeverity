import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

interface Fix {
  lead?: string;
  text: React.ReactNode;
}

interface Release {
  version: string;
  date: string;
  title: string;
  body: React.ReactNode;
  link?: { label: string; href: string };
  fixes?: Fix[];
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] text-white ring-1 ring-inset ring-line-soft">
      {children}
    </code>
  );
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-medium text-white underline decoration-accent decoration-[1.5px] underline-offset-[5px] transition-colors duration-150 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {children}
      <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

/** Newest first. Add each new release at the top. */
const RELEASES: Release[] = [
  {
    version: '0.7.0',
    date: 'Sep 30, 2026',
    title: 'Assessments API',
    body: (
      <>
        Submit code with <Code>POST /v1/assessments</Code>, check progress with{' '}
        <Code>GET /v1/assessments/{'{id}'}</Code>, and fetch the outcome from <Code>.../result</Code>. Assessments are
        queued and processed in the background by a worker.
      </>
    ),
    link: { label: 'Assessments', href: '/docs/api/assessments' },
    fixes: [
      {
        lead: 'Simulated results',
        text: (
          <>
            Until model assessment ships, test keys get a placeholder result marked <Code>"simulated": true</Code>, and
            live keys fail with <Code>ORCHESTRATION_UNAVAILABLE</Code>.
          </>
        ),
      },
      { lead: 'Separate data', text: 'Test keys and live keys never see each other\'s assessments.' },
      { lead: 'Retries', text: 'If a worker stops mid-assessment, another picks it up. After three attempts it is marked failed.' },
    ],
  },
  {
    version: '0.6.0',
    date: 'Sep 30, 2026',
    title: 'API key authentication',
    body: (
      <>
        The public API now accepts API keys. Send your key as <Code>Authorization: Bearer sk_live_…</Code> and call{' '}
        <Code>GET /v1/me</Code> to confirm it works and see which organization it belongs to.
      </>
    ),
    link: { label: 'Authentication', href: '/docs/authentication' },
    fixes: [
      { lead: 'Revocation', text: 'Revoked keys are rejected on their very next request.' },
      { lead: 'Last used', text: 'The dashboard now shows when each key was last used, updated at most once a minute.' },
    ],
  },
  {
    version: '0.5.0',
    date: 'Sep 30, 2026',
    title: 'API keys',
    body: (
      <>
        You can now create, list and revoke API keys from the dashboard, backed by <Code>/v1/api-keys</Code>. Keys use
        the <Code>sk_live_</Code> and <Code>sk_test_</Code> formats. The full key is shown once when you create it, and
        only a hash is stored.
      </>
    ),
    link: { label: 'API keys', href: '/docs/api-keys' },
    fixes: [
      { lead: 'Key limits', text: 'Each organization can hold up to 25 active keys. Revoked keys drop out of the list immediately.' },
      { lead: 'Row menus', text: 'The actions menu on tables no longer gets clipped on the last row.' },
      { lead: 'Docs diagrams', text: 'Diagrams now show the real models: ChatGPT, Gemini and DeepSeek for assessment, and Claude for reassessment.' },
    ],
  },
  {
    version: '0.4.0',
    date: 'Sep 25, 2026',
    title: 'Password reset',
    body: 'Forgot password now emails a single-use reset link, and the reset page lets you choose a new password.',
    link: { label: 'Authentication', href: '/docs/authentication' },
    fixes: [{ lead: 'Email layout', text: 'Transactional emails use a simpler layout with social links in the footer.' }],
  },
  {
    version: '0.3.0',
    date: 'Sep 24, 2026',
    title: 'Accounts and sign in',
    body: (
      <>
        Sign in with Google, GitHub, or email and password. Every new account gets its own organization. Email sign-ups
        are verified with a one-time code, followed by a welcome email.
      </>
    ),
    link: { label: 'Authentication', href: '/docs/authentication' },
    fixes: [
      {
        lead: 'API foundation',
        text: (
          <>
            Health checks at <Code>/health</Code> and <Code>/health/ready</Code>, database migrations, and CI for both
            the API and the web app.
          </>
        ),
      },
    ],
  },
  {
    version: '0.2.0',
    date: 'Sep 20, 2026',
    title: 'New code blocks',
    body: 'Code samples in the docs have language tabs, one-click copy and a new syntax theme set in Geist Mono.',
    link: { label: 'Quickstart', href: '/docs/quickstart' },
  },
  {
    version: '0.1.0',
    date: 'Sep 18, 2026',
    title: 'Documentation launched',
    body: 'The first version of the docs: getting started, core API, concepts, guides, reference and research.',
    link: { label: 'Introduction', href: '/docs/introduction' },
  },
];

export function Changelog() {
  return (
    <ol className="mt-4">
      {RELEASES.map((release) => (
        <li
          key={release.version}
          id={`v${release.version.replaceAll('.', '-')}`}
          className="grid scroll-mt-24 gap-5 pb-20 last:pb-0 md:grid-cols-[160px_1fr] md:gap-10"
        >
          <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-4">
            <span className="rounded-lg bg-accent/15 px-2.5 py-1 font-medium text-[16px] tracking-[-0.01em] text-accent">
              {release.version}
            </span>
            <time className="text-[14.5px] text-faint md:pl-1">{release.date}</time>
          </div>

          <div className="min-w-0">
            <h2 className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-white">{release.title}</h2>
            <p className="mt-5 max-w-2xl text-[16px] leading-[1.85] text-muted">{release.body}</p>
            {release.link ? (
              <p className="mt-5 text-[16px]">
                <DocLink href={release.link.href}>{release.link.label}</DocLink>
              </p>
            ) : null}

            {release.fixes?.length ? (
              <>
                <h3 className="mt-12 text-[22px] font-medium leading-tight tracking-[-0.02em] text-white">
                  Fixes &amp; improvements
                </h3>
                <ol className="mt-5 max-w-2xl list-decimal space-y-3 pl-6 text-[16px] leading-[1.85] text-muted marker:text-faint">
                  {release.fixes.map((fix, index) => (
                    <li key={index} className="pl-2">
                      {fix.lead ? <span className="font-medium text-white">{fix.lead}: </span> : null}
                      {fix.text}
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
