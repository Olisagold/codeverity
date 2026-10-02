import type { DocPage } from '@/types/docs';

const RESULT_EXAMPLE = `{
  "assessment_id": "asm_01JABC123",
  "status": "completed",
  "score": 9.2,
  "confidence": 0.92,
  "criteria": {
    "correctness": 9.5,
    "relevance": 9.0,
    "actionability": 9.2,
    "specificity": 9.4,
    "pedagogical_fit": 8.8
  },
  "feedback": {
    "summary": "Your loop tracks the running maximum correctly, but starting at 0 breaks two cases.",
    "issues": ["find_max([]) returns 0 instead of None."],
    "suggestions": ["Add if not numbers: return None at the top."]
  },
  "rubric_score": 4.1,
  "rubric_scores": [
    { "name": "Edge cases", "weight": 70, "score": 2.0, "comment": "Empty and all-negative lists are wrong." },
    { "name": "Readability", "weight": 30, "score": 9.0, "comment": "Clear names and simple structure." }
  ],
  "simulated": false
}`;

export const coreApiPages: DocPage[] = [
  {
    slug: 'api/assessments',
    section: 'Core API',
    title: 'Assessments',
    description: 'Assessments are the primary resource in the Codeverity API.',
    blocks: [
      {
        type: 'callout',
        tone: 'info',
        title: 'Test keys return simulated results',
        text: 'Assessments made with an `sk_test_` key never call the models. They complete with a placeholder result marked `"simulated": true`, so you can build your integration without spending credit. Live keys run the full pipeline.',
      },
      { type: 'heading', id: 'lifecycle', text: 'Assessment lifecycle' },
      { type: 'custom', component: 'statusFlow' },
      { type: 'heading', id: 'create', text: 'Create an assessment' },
      {
        type: 'endpoint',
        method: 'POST',
        path: '/v1/assessments',
        description: 'Queues a submission for assessment. Poll it or use webhooks for the result.',
        status: '202 Accepted',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "assignment": {
      "title": "Find the maximum number",
      "requirements": "Return the largest number from a list. Return None for an empty list."
    },
    "submission": {
      "code": "def find_max(numbers): ..."
    },
    "rubric": {
      "criteria": [
        { "name": "Edge cases", "description": "Empty and negative lists", "weight": 70 },
        { "name": "Readability", "description": "Clear names, no dead code", "weight": 30 }
      ],
      "learner_level": "beginner"
    }
  }'`,
          },
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `const response = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.CODEVERITY_API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "python",
    assignment: {
      title: "Find the maximum number",
      requirements: "Return the largest number from a list.",
    },
    submission: { code: "def find_max(numbers): ..." },
  }),
});
const assessment = await response.json();`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `import os, requests

assessment = requests.post(
    "https://api.codeverity.com/v1/assessments",
    headers={"Authorization": f"Bearer {os.environ['CODEVERITY_API_KEY']}"},
    json={
        "language": "python",
        "assignment": {
            "title": "Find the maximum number",
            "requirements": "Return the largest number from a list.",
        },
        "submission": {"code": "def find_max(numbers): ..."},
    },
).json()`,
          },
        ],
        response: `{
  "id": "asm_01J9Z3K4X8QH7N2V5T6B0C1D2E",
  "status": "queued",
  "language": "python",
  "created_at": "2026-09-18T12:00:00Z",
  "completed_at": null
}`,
      },
      { type: 'subheading', text: 'Request parameters' },
      {
        type: 'table',
        columns: ['Parameter', 'Type', 'Required', 'Description'],
        rows: [
          ['language', 'string', 'Yes', 'Programming language of the submission, up to 50 characters'],
          ['assignment.title', 'string', 'Yes', 'Name of the assignment, up to 200 characters'],
          ['assignment.requirements', 'string', 'Yes', 'What the code must do, up to 10,000 characters'],
          ['submission.code', 'string', 'Yes', 'Source code being assessed, up to 100,000 characters'],
          ['rubric', 'object', 'No', 'Instructor guidance. See [Rubrics](#rubric) below'],
        ],
      },
      { type: 'heading', id: 'rubric', text: 'Rubrics' },
      {
        type: 'paragraph',
        text: 'A rubric lets the instructor say what matters for this assignment. It shapes what the models focus on and how they weigh it, and adds a weighted grade for the code itself to the result. It is passed to the models as data only, so it cannot change their role or the output format.',
      },
      {
        type: 'table',
        columns: ['Field', 'Type', 'Required', 'Description'],
        rows: [
          ['rubric.criteria', 'array', 'Yes', '1 to 10 criteria. Names must be unique'],
          ['rubric.criteria[].name', 'string', 'Yes', 'Up to 100 characters'],
          ['rubric.criteria[].description', 'string', 'Yes', 'What to look for, up to 500 characters'],
          ['rubric.criteria[].weight', 'integer', 'Yes', '1 to 100. All weights must add up to 100'],
          ['rubric.learner_level', 'string', 'No', '`beginner`, `intermediate`, or `advanced`'],
          ['rubric.notes', 'string', 'No', 'Extra context for the assessment, up to 1,000 characters'],
        ],
      },
      { type: 'heading', id: 'retrieve', text: 'Retrieve an assessment' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}',
        description: 'Returns the current status of an assessment.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123 \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: `{
  "id": "asm_01J9Z3K4X8QH7N2V5T6B0C1D2E",
  "status": "processing",
  "language": "python",
  "created_at": "2026-09-18T12:00:00Z",
  "completed_at": null
}`,
      },
      {
        type: 'table',
        columns: ['Status', 'Meaning'],
        rows: [
          ['queued', 'Accepted and waiting for a worker'],
          ['processing', 'The models are assessing the submission, or the review is running'],
          ['completed', 'The result is available'],
          ['failed', 'The assessment could not be completed'],
        ],
      },
      { type: 'heading', id: 'result', text: 'Retrieve the result' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}/result',
        description: 'Returns the final feedback once the review has completed.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123/result \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: RESULT_EXAMPLE,
      },
      {
        type: 'table',
        columns: ['Status code', 'When'],
        rows: [
          ['200', 'The assessment completed. The body is the result.'],
          ['409', 'The assessment is still `queued` or `processing`. Try again later or wait for the webhook.'],
          ['422', 'The assessment failed. The body includes a `code` and a `detail` explaining why.'],
          ['404', 'No assessment with that ID for this key. Test keys and live keys see separate data.'],
        ],
      },
      {
        type: 'code',
        language: 'json',
        label: '409 · not finished',
        code: `{
  "detail": "The assessment has not finished yet.",
  "status": "processing"
}`,
      },
      {
        type: 'code',
        language: 'json',
        label: '422 · failed',
        code: `{
  "detail": "Not enough models returned an assessment. Please submit it again later.",
  "status": "failed",
  "code": "MODELS_UNAVAILABLE"
}`,
      },
      {
        type: 'paragraph',
        text: 'See [Error codes](/docs/errors) for every failure code. `rubric_score` and `rubric_scores` are only present when the request included a rubric.',
      },
    ],
  },
  {
    slug: 'webhooks',
    section: 'Core API',
    title: 'Webhooks',
    description: 'Webhooks notify your application when an assessment finishes, so you don’t have to poll.',
    blocks: [
      { type: 'heading', id: 'overview', text: 'Why webhooks' },
      {
        type: 'paragraph',
        text: 'Instead of polling `GET /v1/assessments/{id}`, your server receives an `assessment.completed` event with the full result as soon as it is ready.',
      },
      { type: 'heading', id: 'setup', text: 'Add an endpoint' },
      {
        type: 'paragraph',
        text: 'Add endpoints in the dashboard under **Webhooks**. Each endpoint belongs to one environment, so events for test assessments only go to test endpoints. An organization can have up to 10 endpoints. The signing secret is shown once when you create the endpoint; you can rotate it later.',
      },
      {
        type: 'list',
        items: [
          'URLs must use https and resolve to a public address.',
          'Use **Send test event** in the dashboard to receive a `webhook.test` event.',
          'Each endpoint’s page lists recent deliveries with their payload, status, and attempts.',
        ],
      },
      { type: 'heading', id: 'events', text: 'Events' },
      {
        type: 'table',
        columns: ['Event', 'Sent when', '`data` contains'],
        rows: [
          ['assessment.completed', 'The review finished and a result is available', 'The full result, as returned by `/result`'],
          ['assessment.failed', 'The assessment could not be completed', '`assessment_id`, `status`, and `error` with `code` and `message`'],
          ['webhook.test', 'You sent a test event from the dashboard', 'A short message'],
        ],
      },
      { type: 'heading', id: 'delivery', text: 'What a delivery looks like' },
      {
        type: 'code',
        language: 'http',
        label: 'Headers',
        code: `POST https://your-platform.com/webhooks/codeverity
Content-Type: application/json
User-Agent: Codeverity-Webhooks/1.0
Codeverity-Event: assessment.completed
Codeverity-Delivery: 3f0c2a5e-6d7b-4c1e-9a8f-2b4d6e8f0a1c
Codeverity-Signature: t=1758196800,v1=5d41402abc4b2a76b9719d911017c592...`,
      },
      {
        type: 'code',
        language: 'json',
        label: 'Body',
        code: `{
  "id": "evt_01JXYZ3K4X8QH7N2V5T6B0C1D2",
  "type": "assessment.completed",
  "created_at": "2026-09-18T12:05:00Z",
  "data": {
    "assessment_id": "asm_01JABC123",
    "status": "completed",
    "score": 9.2,
    "confidence": 0.92,
    "criteria": { "correctness": 9.5, "...": "..." },
    "feedback": { "summary": "...", "issues": [], "suggestions": [] },
    "rubric_score": null,
    "rubric_scores": null,
    "simulated": false
  }
}`,
      },
      { type: 'heading', id: 'verify', text: 'Verify the signature' },
      {
        type: 'paragraph',
        text: '`v1` is the HMAC-SHA256 of `"<t>.<raw body>"`, keyed with the endpoint’s signing secret. Compute it over the raw request body before parsing JSON, compare in constant time, and reject old timestamps to stop replays.',
      },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `import crypto from "node:crypto";
import express from "express";

app.post("/webhooks/codeverity", express.raw({ type: "application/json" }), (req, res) => {
  const header = req.get("Codeverity-Signature") ?? "";
  const { t, v1 } = Object.fromEntries(header.split(",").map((part) => part.split("=")));
  const expected = crypto
    .createHmac("sha256", process.env.CODEVERITY_WEBHOOK_SECRET)
    .update(\`\${t}.\${req.body}\`)
    .digest("hex");

  const fresh = Math.abs(Date.now() / 1000 - Number(t)) < 300;
  const valid = v1 && v1.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
  if (!fresh || !valid) return res.sendStatus(400);

  res.sendStatus(200);
  const event = JSON.parse(req.body);
  if (event.type === "assessment.completed") saveFeedback(event.data);
});`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `import hashlib, hmac, json, os, time
from fastapi import FastAPI, HTTPException, Request

app = FastAPI()
SECRET = os.environ["CODEVERITY_WEBHOOK_SECRET"].encode()

@app.post("/webhooks/codeverity")
async def codeverity_webhook(request: Request):
    body = await request.body()
    parts = dict(p.split("=", 1) for p in request.headers.get("Codeverity-Signature", "").split(","))
    t, v1 = parts.get("t", "0"), parts.get("v1", "")
    expected = hmac.new(SECRET, f"{t}.".encode() + body, hashlib.sha256).hexdigest()
    if abs(time.time() - int(t)) > 300 or not hmac.compare_digest(v1, expected):
        raise HTTPException(400, "Invalid signature")

    event = json.loads(body)
    if event["type"] == "assessment.completed":
        save_feedback(event["data"])
    return {"received": True}`,
          },
        ],
      },
      { type: 'heading', id: 'retries', text: 'Retries' },
      {
        type: 'paragraph',
        text: 'Any response other than 2xx, or no response within 10 seconds, counts as a failure. Codeverity makes 6 attempts in total, waiting 1 minute, 5 minutes, 30 minutes, 2 hours, then 6 hours between them. Redirects are not followed. Retries reuse the same event `id`, so use it to ignore duplicates.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Respond quickly',
        text: 'Return 2xx as soon as you have stored the event, then do any slow work afterwards.',
      },
    ],
  },
  {
    slug: 'api-keys',
    section: 'Core API',
    title: 'API keys',
    description: 'API keys authenticate your server’s requests to the Codeverity API.',
    blocks: [
      { type: 'heading', id: 'manage', text: 'Create, view, and revoke' },
      {
        type: 'paragraph',
        text: 'Keys are managed in the dashboard under **API Keys**. The full key is shown once when you create it; afterwards only a masked version is visible. Each organization can have up to 25 active keys.',
      },
      { type: 'custom', component: 'apiKeys' },
      { type: 'heading', id: 'formats', text: 'Key formats' },
      {
        type: 'table',
        columns: ['Prefix', 'Environment', 'Behaviour'],
        rows: [
          ['sk_live_', 'Live', 'Runs the full multi-model pipeline. Counts toward the daily live limit'],
          ['sk_test_', 'Test', 'Returns simulated results and never calls the models'],
        ],
      },
      {
        type: 'paragraph',
        text: 'Test and live data are kept apart: a test key can’t read live assessments, and the reverse.',
      },
      { type: 'heading', id: 'check', text: 'Check a key' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/me',
        description: 'Confirms a key works and shows which organization it belongs to.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/me \\
  -H "Authorization: Bearer $CODEVERITY_API_KEY"`,
          },
        ],
        response: `{
  "organization": { "id": "b7dbb439-...", "name": "Acme Academy", "slug": "acme-academy" },
  "api_key": {
    "id": "c16ca26d-...",
    "name": "Production",
    "environment": "live",
    "masked": "sk_live_••••••BbnV"
  }
}`,
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Revoking is immediate',
        text: 'A revoked key is rejected on its very next request with `401 Invalid API key.`',
      },
    ],
  },
  {
    slug: 'usage',
    section: 'Core API',
    title: 'Usage and logs',
    description: 'See request volume, assessment outcomes, and every API call your keys make.',
    blocks: [
      { type: 'heading', id: 'usage', text: 'Usage' },
      {
        type: 'paragraph',
        text: 'The dashboard’s **Usage** page shows requests and assessments for the last 7, 30, or 90 days, completed and failed counts, and a breakdown per API key. Filter by live or test.',
      },
      { type: 'heading', id: 'logs', text: 'Request logs' },
      {
        type: 'paragraph',
        text: 'Every call made with one of your API keys is logged with its method, path, status, duration, and key. Logs are kept for 30 days and can be filtered by method, status, and environment on the **Logs** page.',
      },
      { type: 'heading', id: 'request-id', text: 'Request IDs' },
      {
        type: 'paragraph',
        text: 'Every response includes an `X-Request-Id` header. It matches the log entry for that request, so include it when you contact support.',
      },
      { type: 'code', language: 'http', label: 'Response header', code: 'X-Request-Id: req_01JABC9X2M4N6P8Q0R2S4T6V8W' },
      {
        type: 'cards',
        cards: [{ title: 'Rate limits', text: 'Per key limits and the daily live cap.', to: '/docs/rate-limits' }],
      },
    ],
  },
];
