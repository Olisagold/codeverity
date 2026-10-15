import type { DocPage } from '@/types/docs';

export const guidePages: DocPage[] = [
  {
    slug: 'guides/first-assessment',
    section: 'Guides',
    title: 'Submit your first assessment',
    description: 'A complete integration walkthrough, from API key to feedback shown to a student.',
    blocks: [
      { type: 'heading', id: 'flow', text: 'Integration flow' },
      { type: 'custom', component: 'integrationSteps' },
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
      { type: 'custom', component: 'asyncLifecycle' },
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
    description: 'Add an endpoint, verify the events Codeverity sends, and handle retries.',
    blocks: [
      { type: 'heading', id: 'register', text: '1. Add an endpoint' },
      {
        type: 'list',
        ordered: true,
        items: [
          'In the dashboard, open **Webhooks** and choose **Add endpoint**.',
          'Enter your https URL, pick live or test, and choose the events to receive.',
          'Copy the signing secret. It is shown once; store it as `CODEVERITY_WEBHOOK_SECRET`.',
          'Use **Send test event** on the endpoint’s page to check your handler receives a `webhook.test` event.',
        ],
      },
      { type: 'heading', id: 'verify', text: '2. Verify the signature' },
      {
        type: 'paragraph',
        text: 'Each delivery includes `Codeverity-Signature: t=<unix time>,v1=<hex>`. Recompute the HMAC-SHA256 of `"<t>.<raw body>"` with your secret, compare in constant time, and reject anything older than five minutes. The [Webhooks](/docs/webhooks#verify) page has full handlers in JavaScript and Python.',
      },
      { type: 'heading', id: 'retries', text: '3. Handle retries' },
      {
        type: 'paragraph',
        text: 'Deliveries that don’t return 2xx within 10 seconds are retried up to 6 attempts over about 9 hours. Retries keep the same event `id`, so store it and skip events you have already processed.',
      },
      { type: 'heading', id: 'rotate', text: '4. Rotate the secret' },
      {
        type: 'paragraph',
        text: 'Use **Rotate secret** on the endpoint’s page if the secret may have leaked. The old secret stops working immediately, so update your server at the same time.',
      },
    ],
  },
  {
    slug: 'guides/rubrics',
    section: 'Guides',
    title: 'Grade with instructor rubrics',
    description: 'Let teachers write their own rubric for an assignment and get a weighted grade for the student’s code.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Without a rubric, Codeverity returns feedback for the student. With one, the instructor decides what matters for the assignment: the models focus on those criteria, and the result adds a grade for the code against each one.',
      },
      { type: 'heading', id: 'write', text: '1. Let teachers write the rubric' },
      {
        type: 'paragraph',
        text: 'Give instructors a form on each assignment in your platform and store the rubric with the assignment. Check the rules below in the form, so teachers see mistakes before a student submits.',
      },
      {
        type: 'table',
        columns: ['Field', 'Rule'],
        rows: [
          ['criteria', '1 to 10 criteria. Names must be unique, ignoring case'],
          ['criteria[].name', 'Up to 100 characters, for example `Edge cases`'],
          ['criteria[].description', 'What to look for, up to 500 characters'],
          ['criteria[].weight', 'Whole number from 1 to 100. All weights must add up to 100'],
          ['learner_level', 'Optional: `beginner`, `intermediate`, or `advanced`. Sets the tone of the feedback'],
          ['notes', 'Optional extra context for the assessment, up to 1,000 characters'],
        ],
      },
      { type: 'heading', id: 'send', text: '2. Send it with each submission' },
      {
        type: 'paragraph',
        text: 'Pass the assignment’s rubric as `rubric` on every `POST /v1/assessments` for that assignment. Each request is independent, so Codeverity does not remember a rubric between submissions.',
      },
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
    rubric: {
      criteria: assignment.rubric.criteria, // [{ name, description, weight }]
      learner_level: assignment.rubric.learnerLevel,
      notes: assignment.rubric.notes,
    },
  }),
}).then((res) => res.json());`,
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
        "rubric": {
            "criteria": assignment.rubric["criteria"],  # [{name, description, weight}]
            "learner_level": assignment.rubric.get("learner_level"),
            "notes": assignment.rubric.get("notes"),
        },
    },
).json()`,
          },
        ],
      },
      {
        type: 'paragraph',
        text: 'A rubric that breaks a rule is rejected with a 422 that names the problem, and no assessment is created.',
      },
      {
        type: 'code',
        language: 'json',
        label: '422 · invalid rubric',
        code: `{
  "detail": [
    { "loc": ["body", "rubric"], "msg": "Value error, criteria weights must add up to 100", "type": "value_error" }
  ]
}`,
      },
      { type: 'heading', id: 'grade', text: '3. Read the grade' },
      {
        type: 'paragraph',
        text: 'When the assessment completes, the result includes `rubric_scores`, one entry per criterion in the order you sent them, each scored 0 to 10 with a one sentence comment. `rubric_score` is their weighted average, also 0 to 10.',
      },
      {
        type: 'code',
        language: 'json',
        label: 'GET /v1/assessments/{id}/result',
        code: `{
  "score": 9.1,
  "confidence": 0.86,
  "rubric_score": 4.1,
  "rubric_scores": [
    { "name": "Edge cases", "weight": 70, "score": 2.0, "comment": "Empty and all-negative lists are wrong." },
    { "name": "Readability", "weight": 30, "score": 9.0, "comment": "Clear names and simple structure." }
  ]
}`,
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Use rubric_score as the grade, not score',
        text: '`score` rates the quality of the feedback Codeverity wrote, not the student’s code. The grade for the code is `rubric_score`, and it is only present when the request included a rubric.',
      },
      {
        type: 'paragraph',
        text: 'Show the student their grade and the comment for each criterion next to the feedback. To display it out of 100, multiply `rubric_score` by 10.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Rubrics are guidance, not instructions',
        text: 'The rubric is passed to the models as data. It shapes what they focus on, but text in it cannot change their role or the output format.',
      },
      {
        type: 'cards',
        cards: [
          { title: 'Rubric fields', text: 'Every rubric parameter and limit.', to: '/docs/api/assessments#rubric' },
          { title: 'Response objects', text: 'The full result shape.', to: '/docs/reference/responses' },
        ],
      },
    ],
  },
  {
    slug: 'guides/errors',
    section: 'Guides',
    title: 'Handle errors',
    description: 'How to react to invalid requests, rate limits, and failed assessments.',
    blocks: [
      { type: 'heading', id: 'shape', text: 'Error shape' },
      {
        type: 'paragraph',
        text: 'Errors return a `detail` message. Failed assessments also include a `code`. See [Error codes](/docs/errors) for the full list.',
      },
      {
        type: 'code',
        language: 'json',
        label: '422 · failed assessment',
        code: `{
  "detail": "Not enough models returned an assessment. Please submit it again later.",
  "status": "failed",
  "code": "MODELS_UNAVAILABLE"
}`,
      },
      { type: 'heading', id: 'strategy', text: 'Recommended handling' },
      {
        type: 'table',
        columns: ['Case', 'What to do'],
        rows: [
          ['401', 'Check the key in your environment variables and whether it was revoked.'],
          ['404', 'Check the assessment ID, and that you use the same environment (live or test) that created it.'],
          ['422 on create', 'Fix the field named in `detail`. Don’t retry unchanged.'],
          ['429', 'Wait for `Retry-After` seconds, then retry.'],
          ['MODELS_UNAVAILABLE, REVIEW_FAILED, PROCESSING_TIMEOUT', 'Submit the code again later as a new assessment.'],
          ['500 or INTERNAL_ERROR', 'Retry with backoff. If it persists, contact support with the `X-Request-Id`.'],
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
