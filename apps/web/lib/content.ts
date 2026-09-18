export interface NavGroup {
  label: string;
  items: { label: string; href: string }[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Product',
    items: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Architecture', href: '#architecture' },
    ],
  },
  {
    label: 'Developers',
    items: [
      { label: 'API Reference', href: '/docs/reference/endpoints' },
      { label: 'Authentication', href: '/docs/authentication' },
      { label: 'Webhooks', href: '/docs/webhooks' },
      { label: 'Quickstart', href: '/docs/quickstart' },
    ],
  },
  {
    label: 'Research',
    items: [
      { label: 'Methodology', href: '/docs/research/methodology' },
      { label: 'Evaluation', href: '/docs/research/evaluation-framework' },
    ],
  },
];

export const audiences = ['LMS platforms', 'Coding platforms', 'Universities', 'Bootcamps', 'Developer education'];

export interface ProblemColumn {
  label: string;
  title: string;
  body: string;
  emphasis: boolean;
}

export const problemColumns: ProblemColumn[] = [
  {
    label: '01',
    title: 'Single-model feedback',
    body: 'A single model can produce useful feedback, but its recommendations may be incomplete, incorrect, or inconsistent.',
    emphasis: false,
  },
  {
    label: '02',
    title: 'Multiple models',
    body: 'Different models can identify different issues and produce conflicting recommendations.',
    emphasis: false,
  },
  {
    label: '03',
    title: 'Codeverity',
    body: 'Codeverity independently assesses the submission with multiple models, then evaluates the generated feedback before producing the final result.',
    emphasis: true,
  },
];

export interface Feature {
  title: string;
  body: string;
  icon: 'layers' | 'scale' | 'message' | 'terminal' | 'clock' | 'webhook' | 'key' | 'activity';
}

export const features: Feature[] = [
  {
    title: 'Multi-LLM Assessment',
    body: 'Independently evaluate submissions across multiple language models.',
    icon: 'layers',
  },
  {
    title: 'Reassessment Engine',
    body: 'Compare generated prescriptions and identify disagreements before producing the final result.',
    icon: 'scale',
  },
  {
    title: 'Actionable Feedback',
    body: 'Return specific explanations and recommended code improvements.',
    icon: 'message',
  },
  {
    title: 'API-First',
    body: 'Integrate Codeverity directly into your existing platform using standard HTTP APIs.',
    icon: 'terminal',
  },
  {
    title: 'Async Processing',
    body: 'Submit assessments without keeping your application waiting for multiple model responses.',
    icon: 'clock',
  },
  {
    title: 'Webhooks',
    body: 'Receive assessment completion events directly in your application.',
    icon: 'webhook',
  },
  {
    title: 'API Keys',
    body: 'Secure your integration with organization-specific API keys.',
    icon: 'key',
  },
  {
    title: 'Usage Tracking',
    body: 'Monitor assessment activity and API usage from your dashboard.',
    icon: 'activity',
  },
];

export const evaluationCriteria = ['Correctness', 'Relevance', 'Actionability', 'Specificity', 'Pedagogical appropriateness'];

export const scoreBreakdown = [
  { label: 'Correctness', value: 9.5 },
  { label: 'Relevance', value: 9.0 },
  { label: 'Actionability', value: 9.2 },
  { label: 'Specificity', value: 9.4 },
  { label: 'Pedagogical Fit', value: 8.8 },
];

export const researchMetrics = [
  'Assessment Correctness',
  'Prescription Correctness',
  'Relevance',
  'Actionability',
  'Specificity',
  'Human Expert Agreement',
];

export const researchConfigurations = [
  { label: 'Configuration A', title: 'Single LLM', detail: 'One model produces the assessment and prescription.' },
  { label: 'Configuration B', title: 'Multi-LLM', detail: 'Several models assess the same submission independently.' },
  {
    label: 'Configuration C',
    title: 'Multi-LLM + Reassessment',
    detail: 'Independent assessments are evaluated before the final prescription is selected.',
  },
];

export interface UseCase {
  index: string;
  title: string;
  body: string;
}

export const useCases: UseCase[] = [
  {
    index: '01',
    title: 'LMS Platforms',
    body: 'Add automated code assessment directly to assignments and programming courses.',
  },
  {
    index: '02',
    title: 'Coding Platforms',
    body: 'Evaluate submissions and return structured feedback through your existing workflow.',
  },
  {
    index: '03',
    title: 'Universities',
    body: 'Integrate AI-assisted assessment into programming education without building the assessment infrastructure from scratch.',
  },
  {
    index: '04',
    title: 'Bootcamps',
    body: 'Give learners immediate, actionable feedback on programming assignments.',
  },
];

export const infrastructure = [
  { title: 'API Keys', body: 'Secure authentication for every integration.' },
  { title: 'Rate Limits', body: 'Protect your integration from unexpected traffic.' },
  { title: 'Webhooks', body: 'Receive assessment events when processing completes.' },
  { title: 'Async Processing', body: 'Long-running assessments happen in the background.' },
  { title: 'Usage', body: 'Track API requests and assessment activity.' },
];

export interface FooterColumn {
  title: string;
  items: { label: string; href: string }[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Research', href: '/research' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'Documentation', href: '/docs/introduction' },
      { label: 'API Reference', href: '/docs/reference/endpoints' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'GitHub', href: '#' },
      { label: 'Research', href: '/docs/research/methodology' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
];
