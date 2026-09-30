import React from 'react';

type Tag = 'API' | 'Dashboard' | 'Accounts' | 'Email' | 'Docs' | 'Infrastructure';

interface Entry {
  date: string;
  title: string;
  tags: Tag[];
  items: React.ReactNode[];
}

const TAG_STYLES: Record<Tag, string> = {
  API: 'border-accent/40 text-accent',
  Dashboard: 'border-line-strong text-muted',
  Accounts: 'border-line-strong text-muted',
  Email: 'border-line-strong text-muted',
  Docs: 'border-line-strong text-muted',
  Infrastructure: 'border-line-strong text-muted',
};

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded border border-line bg-base px-1 py-0.5 font-mono text-[12px] text-white">{children}</code>;
}

/** Newest first. Keep entries to things an integrator or dashboard user would notice. */
const ENTRIES: Entry[] = [
  {
    date: 'Sep 30, 2026',
    title: 'API keys',
    tags: ['API', 'Dashboard'],
    items: [
      <>Create, list and revoke API keys from the dashboard, backed by <Code>/v1/api-keys</Code>.</>,
      <>Keys use the <Code>sk_live_…</Code> and <Code>sk_test_…</Code> formats. The full key is shown once at creation and only a hash is stored.</>,
      <>Revoked keys disappear from the list immediately. Each organization can hold up to 25 active keys.</>,
      <>Docs diagrams were redrawn with the actual models: ChatGPT, Gemini and DeepSeek for assessment, Claude for reassessment.</>,
    ],
  },
  {
    date: 'Sep 25, 2026',
    title: 'Password reset',
    tags: ['Accounts', 'Email'],
    items: [
      <>Forgot password now sends a single-use reset link by email, and the reset page sets a new password.</>,
      <>Transactional emails use a simpler plain-text-style layout with social links in the footer.</>,
    ],
  },
  {
    date: 'Sep 24, 2026',
    title: 'Accounts and API foundation',
    tags: ['Accounts', 'Email', 'Infrastructure'],
    items: [
      <>Sign in with Google, GitHub, or email and password. Each new account gets its own organization.</>,
      <>Email sign-up is verified with a one-time code, followed by a welcome email.</>,
      <>The API service is live locally with health checks at <Code>/health</Code> and <Code>/health/ready</Code>, database migrations, and CI for both the API and the web app.</>,
    ],
  },
  {
    date: 'Sep 20, 2026',
    title: 'Code blocks',
    tags: ['Docs'],
    items: [<>Code samples got language tabs, one-click copy and a new syntax theme in Geist Mono.</>],
  },
  {
    date: 'Sep 18, 2026',
    title: 'Documentation launched',
    tags: ['Docs'],
    items: [<>First version of the docs: getting started, core API, concepts, guides, reference and research.</>],
  },
];

export function Changelog() {
  return (
    <ol className="relative">
      {ENTRIES.map((entry, index) => (
        <li key={entry.date} className="grid gap-3 pb-10 last:pb-0 md:grid-cols-[140px_1fr] md:gap-8">
          <div className="md:pt-0.5">
            <time className="font-mono text-[12px] text-faint">{entry.date}</time>
            {index === 0 ? (
              <span className="ml-2 rounded-full border border-ok/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ok md:ml-0 md:mt-2 md:inline-block">
                Latest
              </span>
            ) : null}
          </div>
          <div className="border-line md:border-l md:pl-8">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-medium tracking-[-0.01em] text-white">{entry.title}</h3>
              {entry.tags.map((tag) => (
                <span key={tag} className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] ${TAG_STYLES[tag]}`}>
                  {tag}
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-2">
              {entry.items.map((item, itemIndex) => (
                <li key={itemIndex} className="relative pl-4 text-[14px] leading-relaxed text-muted">
                  <span aria-hidden="true" className="absolute left-0 top-[10px] h-1 w-1 rounded-full bg-faint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
