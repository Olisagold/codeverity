'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRightIcon, BookOpenIcon } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { CopyButton } from '@/components/ui/CopyButton';
import { CodePre } from '@/components/ui/CodePre';
import { LangMark, type LangId } from '@/components/ui/LangMarks';

/* ------------------------------------------------------------------ */
/* Snippets                                                            */
/* ------------------------------------------------------------------ */

interface Lang {
  id: LangId;
  label: string;
  file: string;
  code: string;
}

const RESPONSE = `{
  "id": "asm_01JABC123",
  "status": "completed",
  "score": 9.2,
  "confidence": 0.92,
  "feedback": [
    {
      "line": 2,
      "message": "Initialize max_num from the first element rather than 0.",
      "agreed_by": ["chatgpt", "gemini", "deepseek"]
    }
  ]
}`;

const LANGS: Lang[] = [
  {
    id: 'curl',
    label: 'cURL',
    file: 'terminal',
    code: `curl https://api.codeverity.com/v1/assessments \\
  -H "Authorization: Bearer $CODEVERITY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "assignment": {
      "title": "Find the maximum number",
      "requirements": "Return the largest number from a list of integers"
    },
    "submission": { "code": "def find_max(numbers): ..." }
  }'`,
  },
  {
    id: 'nodedotjs',
    label: 'Node.js',
    file: 'assess.mjs',
    code: `const res = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.CODEVERITY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "python",
    assignment: {
      title: "Find the maximum number",
      requirements: "Return the largest number from a list of integers",
    },
    submission: { code: "def find_max(numbers): ..." },
  }),
});

const assessment = await res.json();
console.log(assessment.id, assessment.status);`,
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    file: 'assess.ts',
    code: `interface Assessment {
  id: string;
  status: "processing" | "completed" | "failed";
  score?: number;
  confidence?: number;
}

const res = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.CODEVERITY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "python",
    assignment: { title: "Find the maximum number", requirements: "Return the largest number" },
    submission: { code: "def find_max(numbers): ..." },
  }),
});

const assessment = (await res.json()) as Assessment;`,
  },
  {
    id: 'python',
    label: 'Python',
    file: 'assess.py',
    code: `import os
import requests

response = requests.post(
    "https://api.codeverity.com/v1/assessments",
    headers={"Authorization": f"Bearer {os.environ['CODEVERITY_API_KEY']}"},
    json={
        "language": "python",
        "assignment": {
            "title": "Find the maximum number",
            "requirements": "Return the largest number from a list of integers",
        },
        "submission": {"code": "def find_max(numbers): ..."},
    },
)

assessment = response.json()
print(assessment["id"], assessment["status"])`,
  },
  {
    id: 'go',
    label: 'Go',
    file: 'main.go',
    code: `payload := map[string]any{
    "language": "python",
    "assignment": map[string]string{
        "title":        "Find the maximum number",
        "requirements": "Return the largest number from a list of integers",
    },
    "submission": map[string]string{"code": "def find_max(numbers): ..."},
}
body, _ := json.Marshal(payload)

req, _ := http.NewRequest("POST", "https://api.codeverity.com/v1/assessments", bytes.NewReader(body))
req.Header.Set("Authorization", "Bearer "+os.Getenv("CODEVERITY_API_KEY"))
req.Header.Set("Content-Type", "application/json")

res, err := http.DefaultClient.Do(req)
if err != nil {
    log.Fatal(err)
}
defer res.Body.Close()`,
  },
  {
    id: 'ruby',
    label: 'Ruby',
    file: 'assess.rb',
    code: `require "net/http"
require "json"

uri = URI("https://api.codeverity.com/v1/assessments")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer #{ENV.fetch("CODEVERITY_API_KEY")}"
req["Content-Type"] = "application/json"
req.body = {
  language: "python",
  assignment: {
    title: "Find the maximum number",
    requirements: "Return the largest number from a list of integers"
  },
  submission: { code: "def find_max(numbers): ..." }
}.to_json

res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
assessment = JSON.parse(res.body)`,
  },
  {
    id: 'php',
    label: 'PHP',
    file: 'assess.php',
    code: `<?php

$payload = [
    "language" => "python",
    "assignment" => [
        "title" => "Find the maximum number",
        "requirements" => "Return the largest number from a list of integers",
    ],
    "submission" => ["code" => "def find_max(numbers): ..."],
];

$ch = curl_init("https://api.codeverity.com/v1/assessments");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . getenv("CODEVERITY_API_KEY"),
    "Content-Type: application/json",
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$assessment = json_decode(curl_exec($ch), true);`,
  },
  {
    id: 'openjdk',
    label: 'Java',
    file: 'Assess.java',
    code: `String body = """
    {
      "language": "python",
      "assignment": {
        "title": "Find the maximum number",
        "requirements": "Return the largest number from a list of integers"
      },
      "submission": { "code": "def find_max(numbers): ..." }
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.codeverity.com/v1/assessments"))
    .header("Authorization", "Bearer " + System.getenv("CODEVERITY_API_KEY"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response =
    HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());`,
  },
  {
    id: 'dotnet',
    label: '.NET',
    file: 'Assess.cs',
    code: `using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", Environment.GetEnvironmentVariable("CODEVERITY_API_KEY"));

var payload = new
{
    language = "python",
    assignment = new
    {
        title = "Find the maximum number",
        requirements = "Return the largest number from a list of integers",
    },
    submission = new { code = "def find_max(numbers): ..." },
};

var response = await client.PostAsJsonAsync("https://api.codeverity.com/v1/assessments", payload);
var assessment = await response.Content.ReadFromJsonAsync<JsonElement>();`,
  },
];

type View = 'request' | 'response';

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function DeveloperSection() {
  const [langId, setLangId] = useState<LangId>('nodedotjs');
  const [view, setView] = useState<View>('request');
  const reduceMotion = useReducedMotion();
  const lang = LANGS.find((l) => l.id === langId) ?? LANGS[0];
  const code = view === 'request' ? lang.code : RESPONSE;
  const file = view === 'request' ? lang.file : 'response.json';

  return (
    <section id="developers" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            Integrate <span className="text-accent">this afternoon</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
            One JSON endpoint, plain HTTP, no SDK lock-in. Send a submission from whatever your platform already
            runs on and get a validated assessment back.
          </p>
        </Reveal>

        {/* Language rail */}
        <Reveal delay={0.05} className="mt-12">
          <div role="tablist" aria-label="Languages" className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 sm:gap-x-5">
            {LANGS.map((item) => {
              const isActive = item.id === langId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setLangId(item.id);
                    setView('request');
                  }}
                  className="group flex w-[72px] flex-col items-center gap-2.5 focus-visible:outline-none"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-colors duration-150 ease-out group-focus-visible:ring-2 group-focus-visible:ring-accent ${
                      isActive
                        ? 'border-line-strong bg-surface-2 text-white'
                        : 'border-line bg-surface text-faint group-hover:border-line-strong group-hover:text-muted'
                    }`}
                  >
                    <LangMark id={item.id} className="h-6 w-6" />
                  </span>
                  <span
                    className={`text-[12.5px] transition-colors duration-150 ${
                      isActive ? 'text-white' : 'text-faint group-hover:text-muted'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Code panel */}
        <Reveal delay={0.08} className="mt-12">
          <div className="code-frame mx-auto max-w-5xl overflow-hidden rounded-2xl border border-line">
            <div className="code-frame__header flex items-center justify-between gap-3 border-b border-line px-3 py-2">
              <div role="tablist" aria-label="Request or response" className="flex items-center gap-1">
                {(['request', 'response'] as View[]).map((item) => {
                  const isActive = item === view;
                  return (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setView(item)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isActive ? 'bg-surface-2 text-white ring-1 ring-inset ring-line-strong' : 'text-faint hover:text-muted'
                      }`}
                    >
                      {item === 'request' ? <LangMark id={lang.id} className="h-3.5 w-3.5" /> : <span className="font-mono text-[11px]">{'{ }'}</span>}
                      {item === 'request' ? lang.file : 'response.json'}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-faint sm:inline">
                  {view === 'request' ? 'POST /v1/assessments' : '200 OK'}
                </span>
                <CopyButton value={code} />
              </div>
            </div>

            <div className="relative min-h-[420px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${lang.id}-${view}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <CodePre code={code} lineNumbers className="min-h-[420px] !px-5 !py-5 !text-[12.5px] !leading-[1.75]" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line px-5 py-3">
              <Link
                href="/docs/quickstart"
                className="flex items-center gap-1.5 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <BookOpenIcon aria-hidden="true" className="h-3.5 w-3.5" />
                Quickstart
              </Link>
              <Link
                href="/docs/reference/endpoints"
                className="flex items-center gap-1.5 text-[12.5px] text-faint transition-colors duration-150 ease-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ArrowUpRightIcon aria-hidden="true" className="h-3.5 w-3.5" />
                API reference
              </Link>
              <span className="ml-auto font-mono text-[11px] text-faint">{file}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
