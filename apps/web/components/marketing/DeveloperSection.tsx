'use client';

import React, { useState } from 'react';
import { ArrowRightIcon, CheckIcon, CopyIcon } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';

type Language = 'cURL' | 'JavaScript' | 'Python';

const snippets: Record<Language, string> = {
  cURL: `curl https://api.codeverity.com/v1/assessments \\
  -H "Authorization: Bearer sk_test_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "assignment": {
      "title": "Find the maximum number",
      "requirements": "Return the largest number"
    },
    "submission": {
      "code": "def find_max(numbers): ..."
    }
  }'`,
  JavaScript: `const res = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_test_xxxxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "python",
    assignment: {
      title: "Find the maximum number",
      requirements: "Return the largest number",
    },
    submission: { code: "def find_max(numbers): ..." },
  }),
});

const assessment = await res.json();`,
  Python: `import requests

response = requests.post(
    "https://api.codeverity.com/v1/assessments",
    headers={"Authorization": "Bearer sk_test_xxxxx"},
    json={
        "language": "python",
        "assignment": {
            "title": "Find the maximum number",
            "requirements": "Return the largest number",
        },
        "submission": {"code": "def find_max(numbers): ..."},
    },
)

assessment = response.json()`,
};

const languages: Language[] = ['cURL', 'JavaScript', 'Python'];

export function DeveloperSection() {
  const [language, setLanguage] = useState<Language>('cURL');
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippets[language]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="developers" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading
          eyebrow="Developers"
          title="Built for developers."
          description="Integrate code assessment with a few API calls."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <div
                role="tablist"
                aria-label="Code examples"
                className="flex items-center justify-between border-b border-line px-2"
              >
                <div className="flex items-center">
                  {languages.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={language === item}
                      onClick={() => setLanguage(item)}
                      className={`relative px-3 py-3 font-mono text-[12px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                        language === item ? 'text-white' : 'text-faint hover:text-muted'
                      }`}
                    >
                      {item}
                      {language === item ? (
                        <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-px bg-accent" />
                      ) : null}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mr-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {copied ? (
                    <CheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-ok" />
                  ) : (
                    <CopyIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-6 text-muted">
                <code>{snippets[language]}</code>
              </pre>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              <Panel label="Response · 202 Accepted" className="flex-1">
                <pre className="px-5 py-5 font-mono text-[12.5px] leading-6 text-muted">
                  <code>
                    {'{\n  '}
                    <span className="text-white">&quot;id&quot;</span>
                    {': '}
                    <span className="text-accent">&quot;asm_01J...&quot;</span>
                    {',\n  '}
                    <span className="text-white">&quot;status&quot;</span>
                    {': '}
                    <span className="text-amber">&quot;processing&quot;</span>
                    {'\n}'}
                  </code>
                </pre>
              </Panel>
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="text-sm leading-relaxed text-muted">
                  Assessments run asynchronously. Poll the assessment or receive a webhook when the
                  reassessment layer completes.
                </p>
                <Button to="/docs/reference/endpoints" variant="secondary" className="mt-4">
                  Explore the API
                  <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
