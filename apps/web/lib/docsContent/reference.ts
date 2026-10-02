import type { DocPage } from '@/types/docs';

export const referencePages: DocPage[] = [
  {
    slug: 'reference/endpoints',
    section: 'Reference',
    title: 'API endpoints',
    description: 'Every endpoint you can call with an API key.',
    blocks: [
      { type: 'heading', id: 'base-url', text: 'Base URL' },
      { type: 'code', language: 'text', label: 'Base URL', code: 'https://api.codeverity.com/v1' },
      {
        type: 'paragraph',
        text: 'Authenticate every request with `Authorization: Bearer sk_live_…` or `sk_test_…`. See [Authentication](/docs/authentication).',
      },
      { type: 'heading', id: 'assessments', text: 'Assessments' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [
          ['/v1/assessments', 'POST', 'Queue a submission for assessment, with an optional rubric'],
          ['/v1/assessments/{id}', 'GET', 'Retrieve an assessment and its status'],
          ['/v1/assessments/{id}/result', 'GET', 'Retrieve the final result'],
        ],
      },
      { type: 'heading', id: 'account', text: 'Account' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [['/v1/me', 'GET', 'Check a key and see its organization']],
      },
      { type: 'heading', id: 'dashboard', text: 'Managed in the dashboard' },
      {
        type: 'paragraph',
        text: 'API keys, webhook endpoints, usage, and request logs are managed in the dashboard while signed in. They are not available with an API key.',
      },
      {
        type: 'cards',
        cards: [
          { title: 'API keys', text: 'Create and revoke keys.', to: '/docs/api-keys' },
          { title: 'Webhooks', text: 'Events, signatures, and retries.', to: '/docs/webhooks' },
          { title: 'Usage and logs', text: 'Request volume and request IDs.', to: '/docs/usage' },
        ],
      },
    ],
  },
  {
    slug: 'reference/parameters',
    section: 'Reference',
    title: 'Request parameters',
    description: 'Parameters accepted when creating an assessment.',
    blocks: [
      { type: 'heading', id: 'assessment', text: 'Assessment object' },
      {
        type: 'table',
        columns: ['Parameter', 'Type', 'Required', 'Description'],
        rows: [
          ['language', 'string', 'Yes', 'Programming language of the submission, up to 50 characters'],
          ['assignment', 'object', 'Yes', 'Assignment information and requirements'],
          ['assignment.title', 'string', 'Yes', 'Name of the assignment, up to 200 characters'],
          ['assignment.requirements', 'string', 'Yes', 'What the code must do, up to 10,000 characters'],
          ['submission', 'object', 'Yes', 'Student submission'],
          ['submission.code', 'string', 'Yes', 'Source code being assessed, up to 100,000 characters'],
          ['rubric', 'object', 'No', 'Instructor guidance and a weighted code grade'],
          ['rubric.criteria', 'array', 'Yes, with a rubric', '1 to 10 criteria, each with `name`, `description`, and `weight`. Weights add up to 100'],
          ['rubric.learner_level', 'string', 'No', '`beginner`, `intermediate`, or `advanced`'],
          ['rubric.notes', 'string', 'No', 'Extra context, up to 1,000 characters'],
        ],
      },
      { type: 'heading', id: 'headers', text: 'Headers' },
      {
        type: 'table',
        columns: ['Header', 'Required', 'Description'],
        rows: [
          ['Authorization', 'Yes', 'Bearer token containing your API key'],
          ['Content-Type', 'Yes, for POST', 'Must be `application/json`'],
        ],
      },
      { type: 'heading', id: 'response-headers', text: 'Response headers' },
      {
        type: 'table',
        columns: ['Header', 'Description'],
        rows: [
          ['X-Request-Id', 'ID of this request. Matches the entry on the Logs page'],
          ['X-RateLimit-Limit', 'Requests allowed per minute for this key'],
          ['X-RateLimit-Remaining', 'Requests left in the current minute'],
          ['X-RateLimit-Reset', 'Seconds until the current minute resets'],
        ],
      },
    ],
  },
  {
    slug: 'reference/responses',
    section: 'Reference',
    title: 'Response objects',
    description: 'The objects returned by the Codeverity API.',
    blocks: [
      { type: 'heading', id: 'assessment', text: 'Assessment' },
      {
        type: 'code',
        language: 'json',
        label: 'Assessment',
        code: `{
  "id": "asm_01J9Z3K4X8QH7N2V5T6B0C1D2E",
  "status": "processing",
  "language": "python",
  "created_at": "2026-09-18T12:00:00Z",
  "completed_at": null
}`,
      },
      { type: 'heading', id: 'result', text: 'Result' },
      {
        type: 'code',
        language: 'json',
        label: 'Result',
        code: `{
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
    "summary": "The solution correctly identifies the maximum value...",
    "issues": [],
    "suggestions": ["Consider explicitly handling an empty input list."]
  },
  "rubric_score": null,
  "rubric_scores": null,
  "simulated": false
}`,
      },
      {
        type: 'table',
        columns: ['Field', 'Type', 'Description'],
        rows: [
          ['score', 'number', 'Quality of the final feedback, 0 to 10: the average of the five criteria'],
          ['confidence', 'number', '0 to 1. Combines how closely the models agreed with the feedback score'],
          ['criteria', 'object', 'Scores for the final feedback on correctness, relevance, actionability, specificity, and pedagogical fit'],
          ['feedback.summary', 'string', 'Explanation written for the student'],
          ['feedback.issues', 'array', 'Problems found in the submission'],
          ['feedback.suggestions', 'array', 'Recommended changes'],
          ['rubric_score', 'number or null', 'Weighted grade for the code against the rubric, 0 to 10. Null without a rubric'],
          ['rubric_scores', 'array or null', 'Per criterion: `name`, `weight`, `score`, and a one sentence `comment`'],
          ['simulated', 'boolean', 'True for placeholder results from test keys'],
        ],
      },
      { type: 'heading', id: 'event', text: 'Webhook event' },
      {
        type: 'code',
        language: 'json',
        label: 'Event',
        code: `{
  "id": "evt_01JXYZ3K4X8QH7N2V5T6B0C1D2",
  "type": "assessment.failed",
  "created_at": "2026-09-18T12:05:00Z",
  "data": {
    "assessment_id": "asm_01JABC123",
    "status": "failed",
    "error": { "code": "MODELS_UNAVAILABLE", "message": "Not enough models returned an assessment." }
  }
}`,
      },
    ],
  },
  {
    slug: 'errors',
    section: 'Reference',
    title: 'Error codes',
    description: 'How Codeverity reports failed requests and failed assessments.',
    blocks: [
      { type: 'heading', id: 'shape', text: 'Error responses' },
      {
        type: 'paragraph',
        text: 'Failed requests return a JSON body with a `detail` message. Validation errors (422) return `detail` as a list, one entry per invalid field.',
      },
      {
        type: 'code',
        language: 'json',
        label: '401',
        code: `{ "detail": "Invalid API key." }`,
      },
      {
        type: 'code',
        language: 'json',
        label: '422 · validation',
        code: `{
  "detail": [
    { "loc": ["body", "rubric"], "msg": "Value error, criteria weights must add up to 100", "type": "value_error" }
  ]
}`,
      },
      { type: 'heading', id: 'http', text: 'HTTP status codes' },
      {
        type: 'table',
        columns: ['Status', 'Meaning'],
        rows: [
          ['401', 'API key missing, malformed, unknown, or revoked'],
          ['404', 'No resource with that ID for this key'],
          ['409', 'The assessment has not finished yet (`/result` only)'],
          ['422', 'Invalid request body, or the assessment failed (`/result`)'],
          ['429', 'A rate limit was hit. See `Retry-After`'],
          ['500', 'Unexpected server error'],
        ],
      },
      { type: 'heading', id: 'codes', text: 'Assessment failure codes' },
      {
        type: 'paragraph',
        text: 'When an assessment fails, `/result` returns 422 with one of these in `code`, and the `assessment.failed` webhook carries the same code.',
      },
      {
        type: 'table',
        columns: ['Code', 'Meaning', 'Retry?'],
        rows: [
          ['MODELS_UNAVAILABLE', 'Fewer than two models returned a usable assessment', 'Yes, later'],
          ['REVIEW_FAILED', 'The final review could not be completed', 'Yes'],
          ['ORCHESTRATION_UNAVAILABLE', 'Model assessment is not configured for live keys', 'No, contact support'],
          ['PROCESSING_TIMEOUT', 'The assessment did not finish after three attempts', 'Yes'],
          ['INTERNAL_ERROR', 'An unexpected error occurred', 'Yes'],
        ],
      },
      {
        type: 'cards',
        cards: [
          { title: 'Handle errors', text: 'Recommended handling per case.', to: '/docs/guides/errors' },
          { title: 'Rate limits', text: 'Limits and the 429 response.', to: '/docs/rate-limits' },
        ],
      },
    ],
  },
  {
    slug: 'rate-limits',
    section: 'Reference',
    title: 'Rate limits',
    description: 'Limits that keep the API responsive and protect against runaway spend.',
    blocks: [
      { type: 'heading', id: 'limits', text: 'Current limits' },
      {
        type: 'table',
        columns: ['Limit', 'Default', 'Applies to'],
        rows: [
          ['Requests', '120 per minute', 'Each API key, all endpoints'],
          ['New assessments', '10 per minute', 'Each API key, `POST /v1/assessments`'],
          ['Live assessments', '200 per day', 'Each organization, live keys only. Resets at 00:00 UTC'],
        ],
      },
      {
        type: 'paragraph',
        text: 'Requests rejected for an invalid body don’t count toward the assessment limits. Test keys never count toward the daily live limit. Webhook deliveries don’t count at all.',
      },
      { type: 'heading', id: 'exceeded', text: 'When a limit is exceeded' },
      { type: 'code', language: 'http', label: 'Status', code: '429 Too Many Requests\nRetry-After: 23' },
      {
        type: 'code',
        language: 'json',
        label: 'Response',
        code: `{ "detail": "Rate limit exceeded. Slow down and retry later." }`,
      },
      {
        type: 'paragraph',
        text: 'Wait for the number of seconds in `Retry-After` before trying again.',
      },
      { type: 'heading', id: 'headers', text: 'Rate limit headers' },
      {
        type: 'table',
        columns: ['Header', 'Description'],
        rows: [
          ['X-RateLimit-Limit', 'Requests allowed per minute for this key'],
          ['X-RateLimit-Remaining', 'Requests left in the current minute'],
          ['X-RateLimit-Reset', 'Seconds until the current minute resets'],
          ['Retry-After', 'On a 429, seconds to wait before retrying'],
        ],
      },
    ],
  },
];
