import type { DocPage } from '@/types/docs';

export const coreApiPages: DocPage[] = [
  {
    slug: 'api/assessments',
    section: 'Core API',
    title: 'Assessments',
    description: 'Assessments are the primary resource in the Codeverity API.',
    blocks: [
      { type: 'heading', id: 'lifecycle', text: 'Assessment lifecycle' },
      { type: 'custom', component: 'statusFlow' },
      { type: 'heading', id: 'create', text: 'Create an assessment' },
      {
        type: 'endpoint',
        method: 'POST',
        path: '/v1/assessments',
        description: 'Creates a new code assessment and places it in the processing queue.',
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
      "requirements": "Return the largest number from a list."
    },
    "submission": {
      "code": "def find_max(numbers): ..."
    }
  }'`,
          },
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `const assessment = await codeverity.assessments.create({
  language: "python",
  assignment: {
    title: "Find the maximum number",
    requirements: "Return the largest number from a list.",
  },
  submission: { code: "def find_max(numbers): ..." },
});`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `assessment = codeverity.assessments.create(
    language="python",
    assignment={
        "title": "Find the maximum number",
        "requirements": "Return the largest number from a list.",
    },
    submission={"code": "def find_max(numbers): ..."},
)`,
          },
        ],
        response: `{
  "id": "asm_01JABC123",
  "status": "queued",
  "created_at": "2026-09-18T12:00:00Z"
}`,
      },
      { type: 'subheading', text: 'Request parameters' },
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
        ],
      },
      { type: 'heading', id: 'retrieve', text: 'Retrieve an assessment' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}',
        description: 'Returns the current state of an assessment.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123 \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: `{
  "id": "asm_01JABC123",
  "status": "processing",
  "created_at": "2026-09-18T12:00:00Z"
}`,
      },
      {
        type: 'table',
        columns: ['Status', 'Meaning'],
        rows: [
          ['queued', 'The assessment has been accepted and is waiting to be processed'],
          ['processing', 'Models are assessing the submission, or reassessment is running'],
          ['completed', 'The result is available'],
          ['failed', 'The assessment could not be completed'],
        ],
      },
      { type: 'heading', id: 'result', text: 'Retrieve the result' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/assessments/{assessment_id}/result',
        description: 'Returns the final feedback once reassessment has completed.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/assessments/asm_01JABC123/result \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: `{
  "assessment_id": "asm_01JABC123",
  "status": "completed",
  "score": 9.2,
  "confidence": 0.92,
  "feedback": {
    "summary": "...",
    "issues": [],
    "suggestions": []
  }
}`,
      },
    ],
  },
  {
    slug: 'webhooks',
    section: 'Core API',
    title: 'Webhooks',
    description: 'Webhooks allow Codeverity to notify your application when an assessment changes state.',
    blocks: [
      { type: 'heading', id: 'overview', text: 'Why webhooks' },
      {
        type: 'paragraph',
        text: 'Instead of continuously requesting `GET /v1/assessments/{id}`, your application can receive an `assessment.completed` event as soon as the result is ready.',
      },
      { type: 'heading', id: 'example', text: 'Example webhook' },
      { type: 'code', language: 'http', label: 'Delivery', code: 'POST https://your-platform.com/webhooks/codeverity' },
      {
        type: 'code',
        language: 'json',
        label: 'Payload',
        code: `{
  "id": "evt_01JXYZ",
  "type": "assessment.completed",
  "created_at": "2026-09-18T12:05:00Z",
  "data": {
    "assessment_id": "asm_01JABC123"
  }
}`,
      },
      { type: 'heading', id: 'events', text: 'Webhook events' },
      {
        type: 'table',
        columns: ['Event', 'Sent when'],
        rows: [
          ['assessment.completed', 'Reassessment finished and a result is available'],
          ['assessment.failed', 'The assessment could not be completed'],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Respond quickly',
        text: 'Return a 2xx response as soon as you have stored the event, then fetch the result with `GET /v1/assessments/{id}/result`. Codeverity retries deliveries that do not return a 2xx.',
      },
      { type: 'heading', id: 'handler', text: 'Example handler' },
      {
        type: 'tabs',
        tabs: [
          {
            label: 'JavaScript',
            language: 'javascript',
            code: `app.post("/webhooks/codeverity", async (req, res) => {
  const event = req.body;
  res.sendStatus(200);

  if (event.type === "assessment.completed") {
    const result = await codeverity.assessments.result(event.data.assessment_id);
    await saveFeedback(result);
  }
});`,
          },
          {
            label: 'Python',
            language: 'python',
            code: `@app.post("/webhooks/codeverity")
def codeverity_webhook(event: dict):
    if event["type"] == "assessment.completed":
        result = codeverity.assessments.result(event["data"]["assessment_id"])
        save_feedback(result)
    return {"received": True}`,
          },
        ],
      },
    ],
  },
  {
    slug: 'api-keys',
    section: 'Core API',
    title: 'API keys',
    description: 'API keys provide secure access to the Codeverity API and associate API requests with your organization.',
    blocks: [
      { type: 'heading', id: 'manage', text: 'Create, view, and revoke' },
      {
        type: 'paragraph',
        text: 'Keys are created from the dashboard or the API. The secret value is shown once at creation time; afterwards only the prefix is visible.',
      },
      { type: 'custom', component: 'apiKeys' },
      { type: 'heading', id: 'endpoints', text: 'Endpoints' },
      {
        type: 'endpoint',
        method: 'POST',
        path: '/v1/api-keys',
        description: 'Creates a new API key for the organization.',
        status: '201 Created',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl https://api.codeverity.com/v1/api-keys \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "Production API", "environment": "live" }'`,
          },
        ],
        response: `{
  "id": "key_01JABC",
  "name": "Production API",
  "environment": "live",
  "secret": "sk_live_xxxxxxxxxxxxxxxx",
  "created_at": "2026-09-18T12:00:00Z"
}`,
      },
      {
        type: 'endpoint',
        method: 'DELETE',
        path: '/v1/api-keys/{key_id}',
        description: 'Revokes a key immediately. Requests using it begin failing with INVALID_API_KEY.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl -X DELETE https://api.codeverity.com/v1/api-keys/key_01JABC \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: `{
  "id": "key_01JABC",
  "revoked": true
}`,
      },
    ],
  },
  {
    slug: 'usage',
    section: 'Core API',
    title: 'Usage',
    description: 'Track API requests and assessment activity for your organization.',
    blocks: [
      { type: 'heading', id: 'retrieve-usage', text: 'Retrieve usage' },
      {
        type: 'endpoint',
        method: 'GET',
        path: '/v1/usage',
        description: 'Returns assessment counts for a given period.',
        request: [
          {
            label: 'cURL',
            language: 'bash',
            code: `curl "https://api.codeverity.com/v1/usage?period=2026-09" \\
  -H "Authorization: Bearer sk_live_xxxxxxxxx"`,
          },
        ],
        response: `{
  "period": "2026-09",
  "assessments": {
    "total": 1284,
    "completed": 1271,
    "failed": 13
  },
  "requests": 3902
}`,
      },
      {
        type: 'table',
        columns: ['Parameter', 'Type', 'Required', 'Description'],
        rows: [
          ['period', 'string', 'No', 'Month in `YYYY-MM` format. Defaults to the current month'],
          ['environment', 'string', 'No', 'Filter by `test` or `live` keys'],
        ],
      },
    ],
  },
];
