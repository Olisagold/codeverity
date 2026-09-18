import type { DocPage } from '@/types/docs';

const introDiagram = `Your Platform
      │
      │ API
      ▼
  Codeverity
      │
      ├── Model A
      ├── Model B
      └── Model C
            │
            ▼
      Reassessment
            │
            ▼
      Final Result`;

const abstractionDiagram = `Without Codeverity              With Codeverity

Your Platform                   Your Platform
  ├── OpenAI integration              │
  ├── Gemini integration              ▼
  ├── Llama integration         Codeverity API
  ├── result normalization
  ├── assessment comparison
  └── feedback refinement`;

export const gettingStartedPages: DocPage[] = [
  {
    slug: 'introduction',
    section: 'Getting Started',
    title: 'Build reliable code assessment into your platform.',
    description:
      'Codeverity provides an API for multi-model code assessment. Submit student code and assignment requirements through a single API and receive structured, actionable feedback generated through independent model assessment and an additional reassessment layer.',
    blocks: [
      {
        type: 'cards',
        cards: [
          { title: 'Quickstart', text: 'Send your first assessment in a few minutes.', to: '/docs/quickstart' },
          {
            title: 'API Reference',
            text: 'Every endpoint, parameter, and response object.',
            to: '/docs/reference/endpoints',
          },
        ],
      },
      { type: 'heading', id: 'overview', text: 'How a request flows' },
      { type: 'diagram', art: introDiagram, caption: 'Submit → assess → reassess → result' },
      { type: 'heading', id: 'what-it-does', text: 'One API for multi-model code assessment' },
      {
        type: 'paragraph',
        text: 'Codeverity abstracts the complexity of working with multiple language models behind a single API. Instead of building and maintaining separate model integrations, result normalization, assessment comparison, and feedback refinement, your application talks to one endpoint.',
      },
      { type: 'diagram', art: abstractionDiagram },
      { type: 'heading', id: 'core-concepts', text: 'Core concepts' },
      {
        type: 'definitions',
        items: [
          { term: 'Organization', text: 'An organization represents the application or institution using Codeverity.' },
          {
            term: 'API key',
            text: 'API keys authenticate requests made to the Codeverity API and associate requests with an organization.',
          },
          {
            term: 'Assessment',
            text: 'An assessment represents a request to evaluate a code submission against a defined assignment or set of requirements.',
          },
          { term: 'Submission', text: "A submission contains the student's source code and programming language." },
          {
            term: 'Reassessment',
            text: 'Reassessment evaluates the independent model-generated assessments against predefined evaluation criteria before producing the final result.',
          },
          {
            term: 'Result',
            text: 'The final structured output returned by Codeverity after assessment and reassessment have completed.',
          },
        ],
      },
      { type: 'heading', id: 'try-it', text: 'See it end to end' },
      {
        type: 'paragraph',
        text: 'The panel below runs a simulated assessment so you can see the stages an assessment moves through before a result is returned.',
      },
      { type: 'custom', component: 'playground' },
      { type: 'heading', id: 'start-building', text: 'Start building' },
      {
        type: 'paragraph',
        text: 'Create an API key, submit an assignment and a code submission, then retrieve the result once the reassessment stage completes.',
      },
      {
        type: 'cards',
        cards: [
          { title: 'Make your first request', text: 'Follow the quickstart end to end.', to: '/docs/quickstart' },
          { title: 'Authentication', text: 'Test keys, live keys, and key handling.', to: '/docs/authentication' },
        ],
      },
    ],
  },
  {
    slug: 'quickstart',
    section: 'Getting Started',
    title: 'Make your first assessment',
    description: 'Send a code submission to Codeverity and retrieve its assessment result in minutes.',
    blocks: [
      { type: 'heading', id: 'get-an-api-key', text: '1. Get an API key' },
      { type: 'paragraph', text: 'Create an API key from your Codeverity dashboard.' },
      { type: 'code', language: 'text', label: 'Dashboard', code: 'Dashboard → API Keys → Create API Key' },
      { type: 'code', language: 'text', label: 'Test key', code: 'sk_test_xxxxxxxxxxxxxxxxx' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Keep your API key private',
        text: 'Never expose secret API keys in browser-side code, mobile applications, public repositories, or client-side JavaScript.',
      },
      { type: 'heading', id: 'first-request', text: '2. Make your first request' },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments \\
  -H "Authorization: Bearer sk_test_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "language": "python",
    "assignment": {
      "title": "Find the maximum number",
      "requirements": "Return the largest number in a list."
    },
    "submission": {
      "code": "def find_max(numbers):\\n    return max(numbers)"
    }
  }'`,
          },
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `const response = await fetch("https://api.codeverity.com/v1/assessments", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_test_xxxxxxxxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    language: "python",
    assignment: {
      title: "Find the maximum number",
      requirements: "Return the largest number in a list.",
    },
    submission: { code: "def find_max(numbers):\\n    return max(numbers)" },
  }),
});

const assessment = await response.json();`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `import requests

response = requests.post(
    "https://api.codeverity.com/v1/assessments",
    headers={"Authorization": "Bearer sk_test_xxxxxxxxx"},
    json={
        "language": "python",
        "assignment": {
            "title": "Find the maximum number",
            "requirements": "Return the largest number in a list.",
        },
        "submission": {"code": "def find_max(numbers):\\n    return max(numbers)"},
    },
)

assessment = response.json()`,
          },
        ],
      },
      { type: 'subheading', text: 'Initial response' },
      {
        type: 'code',
        language: 'json',
        label: '202 Accepted',
        code: `{
  "id": "asm_01JABC123",
  "status": "queued",
  "created_at": "2026-09-18T12:00:00Z"
}`,
      },
      {
        type: 'paragraph',
        text: 'Codeverity processes assessments asynchronously because a submission may be evaluated by multiple models before the reassessment stage is completed.',
      },
      { type: 'heading', id: 'retrieve-the-assessment', text: '3. Retrieve the assessment' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123 \\
  -H "Authorization: Bearer sk_test_xxxxxxxxx"`,
          },
        ],
        response: `{
  "id": "asm_01JABC123",
  "status": "completed"
}`,
      },
      { type: 'heading', id: 'get-the-result', text: '4. Get the result' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}/result',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123/result \\
  -H "Authorization: Bearer sk_test_xxxxxxxxx"`,
          },
        ],
        response: `{
  "assessment_id": "asm_01JABC123",
  "score": 9.2,
  "confidence": 0.92,
  "feedback": {
    "summary": "The solution correctly identifies the maximum value...",
    "issues": [],
    "suggestions": [
      "Consider explicitly handling an empty input list."
    ]
  }
}`,
      },
      { type: 'heading', id: 'next-steps', text: 'Next steps' },
      {
        type: 'cards',
        cards: [
          { title: 'Handle asynchronous results', text: 'Polling and webhooks compared.', to: '/docs/guides/async-assessments' },
          { title: 'Configure webhooks', text: 'Receive assessment events in your app.', to: '/docs/webhooks' },
        ],
      },
    ],
  },
  {
    slug: 'authentication',
    section: 'Getting Started',
    title: 'Authentication',
    description: 'Codeverity uses API keys to authenticate requests.',
    blocks: [
      { type: 'heading', id: 'api-keys', text: 'API keys' },
      { type: 'paragraph', text: 'Every API request must include an `Authorization` header with a bearer token.' },
      { type: 'code', language: 'http', label: 'Header', code: 'Authorization: Bearer YOUR_API_KEY' },
      { type: 'code', language: 'http', label: 'Example', code: 'Authorization: Bearer sk_live_xxxxxxxxx' },
      { type: 'heading', id: 'test-keys', text: 'Test keys' },
      {
        type: 'paragraph',
        text: 'Keys prefixed with `sk_test_` are for development and testing. Assessments created with a test key are processed the same way but are not counted towards production usage.',
      },
      { type: 'heading', id: 'live-keys', text: 'Live keys' },
      {
        type: 'paragraph',
        text: 'Keys prefixed with `sk_live_` are for production traffic from your platform.',
      },
      { type: 'heading', id: 'security', text: 'Security' },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Never commit live API keys to source control',
        text: 'Call the Codeverity API from your server, store keys in environment variables, and revoke any key that may have been exposed.',
      },
      {
        type: 'list',
        items: [
          'Send requests only from your backend, never from a browser or mobile client.',
          'Use a separate key per environment so a revocation does not take down production.',
          'Rotate keys when a team member with access leaves.',
        ],
      },
      {
        type: 'code',
        language: 'json',
        label: '401 Unauthorized',
        code: `{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "API key is missing or invalid."
  }
}`,
      },
    ],
  },
];
