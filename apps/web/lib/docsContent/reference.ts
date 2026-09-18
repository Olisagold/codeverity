import type { DocPage } from '@/types/docs';

export const referencePages: DocPage[] = [
  {
    slug: 'reference/endpoints',
    section: 'Reference',
    title: 'API endpoints',
    description: 'Every endpoint exposed by the Codeverity API.',
    blocks: [
      { type: 'heading', id: 'base-url', text: 'Base URL' },
      { type: 'code', language: 'text', label: 'Base URL', code: 'https://api.codeverity.com/v1' },
      { type: 'heading', id: 'assessments', text: 'Assessments' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [
          ['/v1/assessments', 'POST', 'Create an assessment'],
          ['/v1/assessments/{id}', 'GET', 'Retrieve an assessment and its status'],
          ['/v1/assessments/{id}/result', 'GET', 'Retrieve the final result'],
        ],
      },
      { type: 'heading', id: 'webhooks', text: 'Webhooks' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [['/v1/webhooks', 'POST', 'Register a webhook endpoint']],
      },
      { type: 'heading', id: 'api-keys', text: 'API keys' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [
          ['/v1/api-keys', 'GET', 'List API keys for the organization'],
          ['/v1/api-keys', 'POST', 'Create an API key'],
          ['/v1/api-keys/{id}', 'DELETE', 'Revoke an API key'],
        ],
      },
      { type: 'heading', id: 'usage', text: 'Usage' },
      {
        type: 'table',
        columns: ['Endpoint', 'Method', 'Description'],
        rows: [['/v1/usage', 'GET', 'Retrieve assessment and request counts']],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'The OpenAPI specification is the source of truth',
        text: 'These pages describe the planned API surface. As endpoints ship, the published OpenAPI specification defines the exact contract.',
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
          ['language', 'string', 'Yes', 'Programming language used by the submission'],
          ['assignment', 'object', 'Yes', 'Assignment information and requirements'],
          ['assignment.title', 'string', 'Yes', 'Name of the assignment'],
          ['assignment.requirements', 'string', 'Yes', 'Requirements used during assessment'],
          ['submission', 'object', 'Yes', 'Student submission'],
          ['submission.code', 'string', 'Yes', 'Source code being assessed'],
          ['submission.external_id', 'string', 'No', 'Identifier from the integrating platform'],
          ['student.external_id', 'string', 'No', 'Identifier supplied by the integrating platform'],
        ],
      },
      { type: 'heading', id: 'headers', text: 'Headers' },
      {
        type: 'table',
        columns: ['Header', 'Required', 'Description'],
        rows: [
          ['Authorization', 'Yes', 'Bearer token containing your API key'],
          ['Content-Type', 'Yes', 'Must be `application/json`'],
          ['Idempotency-Key', 'No', 'Prevents duplicate assessments when a request is retried'],
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
  "id": "asm_01JABC123",
  "status": "processing",
  "language": "python",
  "created_at": "2026-09-18T12:00:00Z"
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
    "suggestions": [
      "Consider explicitly handling an empty input list."
    ]
  }
}`,
      },
      {
        type: 'table',
        columns: ['Field', 'Type', 'Description'],
        rows: [
          ['score', 'number', 'Overall assessment score from 0 to 10'],
          ['confidence', 'number', 'Agreement between independent assessments, from 0 to 1'],
          ['criteria', 'object', 'Per-criterion scores produced during reassessment'],
          ['feedback.summary', 'string', 'Explanation written for the student'],
          ['feedback.issues', 'array', 'Problems identified in the submission'],
          ['feedback.suggestions', 'array', 'Recommended changes'],
        ],
      },
      { type: 'heading', id: 'event', text: 'Webhook event' },
      {
        type: 'code',
        language: 'json',
        label: 'Event',
        code: `{
  "id": "evt_01JXYZ",
  "type": "assessment.completed",
  "created_at": "2026-09-18T12:05:00Z",
  "data": {
    "assessment_id": "asm_01JABC123"
  }
}`,
      },
    ],
  },
  {
    slug: 'errors',
    section: 'Reference',
    title: 'Error codes',
    description: 'Codeverity returns a consistent error structure for every failed request.',
    blocks: [
      { type: 'heading', id: 'shape', text: 'Error object' },
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
      { type: 'heading', id: 'codes', text: 'Codes' },
      {
        type: 'table',
        columns: ['HTTP status', 'Code', 'Meaning'],
        rows: [
          ['400', 'INVALID_REQUEST', 'Request validation failed'],
          ['401', 'INVALID_API_KEY', 'API key is missing or invalid'],
          ['404', 'RESOURCE_NOT_FOUND', 'Resource does not exist'],
          ['422', 'ASSESSMENT_FAILED', 'The assessment could not be completed'],
          ['429', 'RATE_LIMIT_EXCEEDED', 'Too many requests'],
          ['500', 'INTERNAL_ERROR', 'Unexpected server error'],
        ],
      },
      {
        type: 'cards',
        cards: [
          { title: 'Handle errors', text: 'Recommended retry behaviour per code.', to: '/docs/guides/errors' },
          { title: 'Rate limits', text: 'Limits and the 429 response.', to: '/docs/rate-limits' },
        ],
      },
    ],
  },
  {
    slug: 'rate-limits',
    section: 'Reference',
    title: 'Rate limits',
    description:
      'Rate limits protect the API from excessive traffic and help maintain predictable service availability.',
    blocks: [
      { type: 'heading', id: 'limits', text: 'Current limits' },
      { type: 'code', language: 'text', label: 'Default limit', code: '100 requests / minute' },
      {
        type: 'paragraph',
        text: 'Limits apply per organization across all API keys. Creating an assessment and polling its status both count towards the limit — webhooks do not.',
      },
      { type: 'heading', id: 'exceeded', text: 'When a limit is exceeded' },
      { type: 'code', language: 'http', label: 'Status', code: '429 Too Many Requests' },
      {
        type: 'code',
        language: 'json',
        label: 'Response',
        code: `{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests."
  }
}`,
      },
      { type: 'heading', id: 'headers', text: 'Rate limit headers' },
      {
        type: 'table',
        columns: ['Header', 'Description'],
        rows: [
          ['RateLimit-Limit', 'Requests permitted in the current window'],
          ['RateLimit-Remaining', 'Requests remaining in the current window'],
          ['RateLimit-Reset', 'Seconds until the window resets'],
        ],
      },
    ],
  },
];
