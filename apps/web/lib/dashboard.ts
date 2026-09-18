import type { ApiKey, Assessment, LogEntry, SeriesPoint, WebhookEndpoint } from '@/types/dashboard';

export const organization = {
  name: 'Codeverity Demo',
  slug: 'codeverity-demo',
  id: 'org_01JABCDEF7Q2',
  created: 'September 18, 2026',
  members: [
    { name: 'Admin User', email: 'admin@codeverity.dev', role: 'Owner' },
    { name: 'Developer', email: 'dev@codeverity.dev', role: 'Member' },
  ],
};

export const currentUser = {
  name: 'Admin User',
  email: 'admin@codeverity.dev',
  initials: 'AU',
};

const defaultCode = `def find_max(numbers):
    max_num = 0

    for number in numbers:
        if number > max_num:
            max_num = number

    return max_num`;

const defaultModels = [
  {
    name: 'Model A',
    model: 'openai',
    score: 8.5,
    issues: 1,
    prescription: 'Initialize max_num using the first element of the list rather than 0.',
  },
  {
    name: 'Model B',
    model: 'gemini',
    score: 9.0,
    issues: 1,
    prescription: 'Handle lists containing only negative numbers.',
  },
  {
    name: 'Model C',
    model: 'llama',
    score: 8.8,
    issues: 1,
    prescription: 'Avoid assuming zero is the smallest possible input.',
  },
];

const defaultCriteria = [
  { label: 'Correctness', value: 9.5 },
  { label: 'Relevance', value: 9.0 },
  { label: 'Actionability', value: 9.2 },
  { label: 'Specificity', value: 9.4 },
  { label: 'Pedagogical appropriateness', value: 8.8 },
];

export const assessments: Assessment[] = [
  {
    id: 'asm_01JABC123',
    status: 'completed',
    language: 'Python',
    score: 9.2,
    confidence: 0.92,
    processingSeconds: 18.4,
    created: '2m ago',
    assignment: {
      title: 'Find the maximum number',
      requirements: 'Return the largest number from a list of integers.',
    },
    code: defaultCode,
    models: defaultModels,
    criteria: defaultCriteria,
    reassessmentSummary:
      'The models independently identified the initialization of max_num as a potential issue when the input contains only negative values. The recommendation to initialize from the first list element was selected because it directly addresses the identified edge case.',
    finalSummary:
      'Your solution correctly finds the maximum value for lists containing positive values. However, initializing max_num to 0 causes incorrect results when all values are negative.',
    recommendation: 'Initialize max_num with the first element of the input list.',
  },
  {
    id: 'asm_01JABD456',
    status: 'processing',
    language: 'Java',
    score: null,
    confidence: null,
    processingSeconds: null,
    created: '5m ago',
    assignment: {
      title: 'Reverse a linked list',
      requirements: 'Reverse the nodes of a singly linked list in place.',
    },
    code: `public ListNode reverse(ListNode head) {
    ListNode prev = null;
    while (head != null) {
        head = head.next;
    }
    return prev;
}`,
    models: [],
    criteria: [],
    reassessmentSummary: '',
    finalSummary: '',
    recommendation: '',
  },
  {
    id: 'asm_01JABE789',
    status: 'completed',
    language: 'JavaScript',
    score: 8.7,
    confidence: 0.88,
    processingSeconds: 21.1,
    created: '12m ago',
    assignment: {
      title: 'Sum even numbers',
      requirements: 'Return the sum of all even numbers in an array.',
    },
    code: `function sumEven(numbers) {
  let total = 0;
  for (const n of numbers) {
    if (n % 2) total += n;
  }
  return total;
}`,
    models: [
      {
        name: 'Model A',
        model: 'openai',
        score: 8.4,
        issues: 1,
        prescription: 'The parity check is inverted; use n % 2 === 0.',
      },
      {
        name: 'Model B',
        model: 'gemini',
        score: 8.9,
        issues: 2,
        prescription: 'Fix the parity check and guard against non-numeric input.',
      },
      {
        name: 'Model C',
        model: 'llama',
        score: 8.6,
        issues: 1,
        prescription: 'Use a filter and reduce for clarity.',
      },
    ],
    criteria: [
      { label: 'Correctness', value: 9.1 },
      { label: 'Relevance', value: 8.8 },
      { label: 'Actionability', value: 8.9 },
      { label: 'Specificity', value: 8.4 },
      { label: 'Pedagogical appropriateness', value: 8.3 },
    ],
    reassessmentSummary:
      'Two models identified the inverted parity check. The prescription that named the exact expression was selected over the stylistic refactor because it resolves the failing behaviour directly.',
    finalSummary: 'The loop adds odd numbers instead of even numbers because n % 2 is truthy for odd values.',
    recommendation: 'Change the condition to n % 2 === 0.',
  },
  {
    id: 'asm_01JABF012',
    status: 'failed',
    language: 'Python',
    score: null,
    confidence: null,
    processingSeconds: null,
    created: '20m ago',
    assignment: {
      title: 'Binary search',
      requirements: 'Return the index of a target value in a sorted list.',
    },
    code: 'def search(values, target):\n    ...',
    models: [],
    criteria: [],
    reassessmentSummary: '',
    finalSummary: '',
    recommendation: '',
  },
  {
    id: 'asm_01JABG345',
    status: 'completed',
    language: 'Python',
    score: 7.8,
    confidence: 0.81,
    processingSeconds: 16.9,
    created: '34m ago',
    assignment: {
      title: 'Count word frequency',
      requirements: 'Return a dictionary mapping each word to its frequency.',
    },
    code: `def word_count(text):
    counts = {}
    for word in text.split():
        counts[word] += 1
    return counts`,
    models: defaultModels,
    criteria: defaultCriteria,
    reassessmentSummary:
      'All three models identified the missing key initialization. The most specific prescription was selected.',
    finalSummary: 'Incrementing a missing dictionary key raises a KeyError on the first occurrence of a word.',
    recommendation: 'Use counts.get(word, 0) + 1 or collections.Counter.',
  },
  {
    id: 'asm_01JABH678',
    status: 'queued',
    language: 'JavaScript',
    score: null,
    confidence: null,
    processingSeconds: null,
    created: '41m ago',
    assignment: { title: 'Debounce a function', requirements: 'Implement a debounce helper.' },
    code: 'function debounce(fn, wait) { /* ... */ }',
    models: [],
    criteria: [],
    reassessmentSummary: '',
    finalSummary: '',
    recommendation: '',
  },
  {
    id: 'asm_01JABI901',
    status: 'completed',
    language: 'Java',
    score: 9.0,
    confidence: 0.9,
    processingSeconds: 19.8,
    created: '1h ago',
    assignment: { title: 'Palindrome check', requirements: 'Return true when a string is a palindrome.' },
    code: `public boolean isPalindrome(String s) {
    return new StringBuilder(s).reverse().toString().equals(s);
}`,
    models: defaultModels,
    criteria: defaultCriteria,
    reassessmentSummary:
      'Models agreed on correctness but disagreed on whether case and punctuation handling was required by the assignment. The requirement text was used to resolve the disagreement.',
    finalSummary: 'The implementation is correct for the stated requirements but ignores casing.',
    recommendation: 'Normalize the input before comparing when casing should be ignored.',
  },
  {
    id: 'asm_01JABJ234',
    status: 'completed',
    language: 'Python',
    score: 8.3,
    confidence: 0.85,
    processingSeconds: 17.2,
    created: '2h ago',
    assignment: { title: 'FizzBuzz', requirements: 'Print FizzBuzz for numbers 1 to n.' },
    code: `def fizzbuzz(n):
    for i in range(n):
        print(i)`,
    models: defaultModels,
    criteria: defaultCriteria,
    reassessmentSummary: 'The models agreed the required branching logic is missing entirely.',
    finalSummary: 'The function prints numbers but never applies the Fizz, Buzz, or FizzBuzz rules.',
    recommendation: 'Add the divisibility checks and iterate from 1 to n inclusive.',
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: 'key_01JABC',
    name: 'Production',
    masked: 'sk_live_••••••91K2',
    environment: 'live',
    description: 'Main production integration',
    lastUsed: '2 minutes ago',
    created: 'Sep 18, 2026',
    requests: 12483,
    assessments: 3241,
    active: true,
  },
  {
    id: 'key_01JABD',
    name: 'Development',
    masked: 'sk_test_••••••2F8A',
    environment: 'test',
    description: 'Local development',
    lastUsed: '3 days ago',
    created: 'Sep 15, 2026',
    requests: 1902,
    assessments: 480,
    active: true,
  },
];

export const webhooks: WebhookEndpoint[] = [
  {
    id: 'whk_01JABC',
    url: 'https://example.com/api/codeverity/webhook',
    active: true,
    events: ['assessment.completed', 'assessment.failed'],
    lastDelivery: '2 minutes ago',
    deliveries: [
      {
        id: 'evt_01JXYZ1',
        event: 'assessment.completed',
        status: 200,
        time: '2m ago',
        request: `{
  "id": "evt_01JXYZ1",
  "type": "assessment.completed",
  "created_at": "2026-09-18T12:05:00Z",
  "data": { "assessment_id": "asm_01JABC123" }
}`,
        response: `{
  "received": true
}`,
      },
      {
        id: 'evt_01JXYZ2',
        event: 'assessment.completed',
        status: 200,
        time: '8m ago',
        request: `{
  "id": "evt_01JXYZ2",
  "type": "assessment.completed",
  "data": { "assessment_id": "asm_01JABE789" }
}`,
        response: `{
  "received": true
}`,
      },
      {
        id: 'evt_01JXYZ3',
        event: 'assessment.failed',
        status: 500,
        time: '15m ago',
        request: `{
  "id": "evt_01JXYZ3",
  "type": "assessment.failed",
  "data": { "assessment_id": "asm_01JABF012" }
}`,
        response: `{
  "error": "Internal Server Error"
}`,
      },
    ],
  },
];

export const logs: LogEntry[] = [
  { id: 'req_1', time: '12:04:21', method: 'POST', endpoint: '/v1/assessments', status: 202, duration: '142ms', key: 'Production' },
  { id: 'req_2', time: '12:04:18', method: 'GET', endpoint: '/v1/assessments/asm_01JABC123', status: 200, duration: '41ms', key: 'Production' },
  { id: 'req_3', time: '12:03:52', method: 'POST', endpoint: '/v1/assessments', status: 401, duration: '12ms', key: '—' },
  { id: 'req_4', time: '12:03:31', method: 'GET', endpoint: '/v1/assessments/asm_01JABE789/result', status: 200, duration: '58ms', key: 'Production' },
  { id: 'req_5', time: '12:02:44', method: 'POST', endpoint: '/v1/assessments', status: 202, duration: '151ms', key: 'Development' },
  { id: 'req_6', time: '12:01:09', method: 'GET', endpoint: '/v1/usage', status: 200, duration: '33ms', key: 'Production' },
  { id: 'req_7', time: '11:59:58', method: 'POST', endpoint: '/v1/assessments', status: 429, duration: '9ms', key: 'Development' },
  { id: 'req_8', time: '11:58:12', method: 'DELETE', endpoint: '/v1/api-keys/key_01JABE', status: 200, duration: '64ms', key: 'Production' },
];

export const series7d: SeriesPoint[] = [
  { label: 'Mon', requests: 1420, assessments: 402 },
  { label: 'Tue', requests: 1680, assessments: 471 },
  { label: 'Wed', requests: 1290, assessments: 366 },
  { label: 'Thu', requests: 1905, assessments: 540 },
  { label: 'Fri', requests: 2240, assessments: 631 },
  { label: 'Sat', requests: 980, assessments: 246 },
  { label: 'Sun', requests: 1120, assessments: 302 },
];

export const series30d: SeriesPoint[] = Array.from({ length: 30 }, (_, index) => {
  const base = 900 + (index * 137) % 1200;
  return {
    label: `${index + 1}`,
    requests: base,
    assessments: Math.round(base * 0.28),
  };
});

export const series90d: SeriesPoint[] = Array.from({ length: 30 }, (_, index) => {
  const base = 1100 + (index * 211) % 1500;
  return {
    label: `W${index + 1}`,
    requests: base,
    assessments: Math.round(base * 0.26),
  };
});

export function seriesForRange(range: '7d' | '30d' | '90d') {
  if (range === '30d') return series30d;
  if (range === '90d') return series90d;
  return series7d;
}
