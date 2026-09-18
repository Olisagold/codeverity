import type { DocPage } from '@/types/docs';

const asyncDiagram = `POST /v1/assessments
        ↓
   202 Accepted
        ↓
 status: queued
        ↓
 status: processing
        ↓
 status: completed`;

const integrationDiagram = `1. Create API key
        ↓
2. Submit assignment + code
        ↓
3. Receive assessment ID
        ↓
4. Wait for completion
        ↓
5. Retrieve result
        ↓
6. Display feedback to student`;

export const guidePages: DocPage[] = [
  {
    slug: 'guides/first-assessment',
    section: 'Guides',
    title: 'Submit your first assessment',
    description: 'A complete integration walkthrough, from API key to feedback shown to a student.',
    blocks: [
      { type: 'heading', id: 'flow', text: 'Integration flow' },
      { type: 'diagram', art: integrationDiagram },
      { type: 'heading', id: 'submit', text: '1. Submit the submission' },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `const assessment = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.CODEVERITY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: submission.language,
    assignment: {
      title: assignment.title,
      requirements: assignment.requirements,
    },
    submission: { code: submission.code },
  }),
}).then((res) => res.json());

await db.submissions.update(submission.id, {
  assessmentId: assessment.id,
  assessmentStatus: assessment.status,
});`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `assessment = requests.post(
    "https://api.codeverity.com/v1/assessments",
    headers={"Authorization": f"Bearer {CODEVERITY_API_KEY}"},
    json={
        "language": submission.language,
        "assignment": {
            "title": assignment.title,
            "requirements": assignment.requirements,
        },
        "submission": {"code": submission.code},
    },
).json()

submission.assessment_id = assessment["id"]
submission.save()`,
          },
        ],
      },
      { type: 'heading', id: 'store', text: '2. Store the assessment id' },
      {
        type: 'paragraph',
        text: 'Persist the returned `id` against your own submission record. Everything else — status checks, results, webhook events — is keyed on it.',
      },
      { type: 'heading', id: 'display', text: '3. Display the feedback' },
      {
        type: 'paragraph',
        text: 'Show the summary and suggestions to the student, and keep the per-criterion scores for instructors who need to review how the feedback was produced.',
      },
      {
        type: 'cards',
        cards: [
          { title: 'Handle asynchronous results', text: 'Polling vs. webhooks.', to: '/docs/guides/async-assessments' },
          { title: 'Handle errors', text: 'Retries, failures, and error codes.', to: '/docs/guides/errors' },
        ],
      },
    ],
  },
  {
    slug: 'guides/async-assessments',
    section: 'Guides',
    title: 'Handle asynchronous results',
    description: 'Assessment processing requires multiple model calls and therefore runs asynchronously.',
    blocks: [
      { type: 'heading', id: 'lifecycle', text: 'Request lifecycle' },
      { type: 'diagram', art: asyncDiagram },
      { type: 'heading', id: 'polling', text: 'Option 1 — Polling' },
      {
        type: 'paragraph',
        text: 'Poll `GET /v1/assessments/{id}` with a backoff until the status is `completed` or `failed`. Polling is the simplest option when your platform cannot expose a public endpoint.',
      },
      {
        type: 'code',
        language: 'javascript',
        label: 'Polling with backoff',
        code: `async function waitForResult(id) {
  let delay = 1000;

  for (let attempt = 0; attempt < 10; attempt++) {
    const assessment = await codeverity.assessments.retrieve(id);

    if (assessment.status === "completed") {
      return codeverity.assessments.result(id);
    }
    if (assessment.status === "failed") {
      throw new Error("Assessment failed");
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, 15000);
  }
}`,
      },
      { type: 'heading', id: 'webhooks', text: 'Option 2 — Webhooks' },
      {
        type: 'paragraph',
        text: 'Register a webhook endpoint and react to `assessment.completed`. This removes polling traffic entirely and delivers feedback to the student as soon as it is ready.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Use both in production',
        text: 'Webhooks for normal delivery, plus a slow reconciliation poll for assessments that never received an event.',
      },
    ],
  },
  {
    slug: 'guides/webhooks',
    section: 'Guides',
    title: 'Configure webhooks',
    description: 'Register an endpoint and verify the events Codeverity sends to it.',
    blocks: [
      { type: 'heading', id: 'register', text: '1. Register an endpoint' },
      {
        type: 'endpoint',
        method: 'POST',
        path: '/v1/webhooks',
        description: 'Registers a URL to receive assessment events.',
        status: '201 Created',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/webhooks \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-platform.com/webhooks/codeverity",
    "events": ["assessment.completed", "assessment.failed"]
  }'`,
          },
        ],
        response: `{
  "id": "whk_01JABC",
  "url": "https://your-platform.com/webhooks/codeverity",
  "events": ["assessment.completed", "assessment.failed"],
  "secret": "whsec_xxxxxxxxxxxx"
}`,
      },
      { type: 'heading', id: 'verify', text: '2. Verify the signature' },
      {
        type: 'paragraph',
        text: 'Each delivery includes a `Codeverity-Signature` header computed with the webhook secret. Reject any request whose signature does not match.',
      },
      { type: 'heading', id: 'retries', text: '3. Handle retries' },
      {
        type: 'paragraph',
        text: 'Deliveries that do not return a 2xx are retried with exponential backoff. Treat events as idempotent and key them on `id`.',
      },
    ],
  },
  {
    slug: 'guides/errors',
    section: 'Guides',
    title: 'Handle errors',
    description: 'How to react to validation failures, rate limits, and failed assessments.',
    blocks: [
      { type: 'heading', id: 'shape', text: 'Error shape' },
      {
        type: 'code',
        language: 'json',
        label: 'Error',
        code: `{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The language field is required."
  }
}`,
      },
      { type: 'heading', id: 'strategy', text: 'Recommended handling' },
      {
        type: 'table',
        columns: ['Code', 'What to do'],
        rows: [
          ['INVALID_REQUEST', 'Fix the payload. Do not retry unchanged.'],
          ['INVALID_API_KEY', 'Check the environment variable and whether the key was revoked.'],
          ['RESOURCE_NOT_FOUND', 'Verify the assessment id you stored against your submission.'],
          ['RATE_LIMIT_EXCEEDED', 'Back off and retry after the window resets.'],
          ['ASSESSMENT_FAILED', 'Surface a neutral message to the student and requeue the submission.'],
          ['INTERNAL_ERROR', 'Retry with backoff; contact support if it persists.'],
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Never block a student on an assessment',
        text: 'Show the submission as received and attach feedback when the assessment completes, so a failed assessment never blocks coursework.',
      },
    ],
  },
];
