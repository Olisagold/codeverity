import { gettingStartedPages } from './docsContent/gettingStarted';
import { coreApiPages } from './docsContent/coreApi';
import { conceptPages } from './docsContent/concepts';
import { guidePages } from './docsContent/guides';
import { referencePages } from './docsContent/reference';
import { researchPages } from './docsContent/research';
import type { DocPage, DocsNavGroup } from '@/types/docs';

export const docsPages: DocPage[] = [
  ...gettingStartedPages,
  ...coreApiPages,
  ...conceptPages,
  ...guidePages,
  ...referencePages,
  ...researchPages,
];

export const docsNav: DocsNavGroup[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', slug: 'introduction' },
      { title: 'Quickstart', slug: 'quickstart' },
      { title: 'Authentication', slug: 'authentication' },
    ],
  },
  {
    title: 'Core API',
    items: [
      { title: 'Assessments', slug: 'api/assessments' },
      { title: 'Webhooks', slug: 'webhooks' },
      { title: 'API Keys', slug: 'api-keys' },
      { title: 'Usage', slug: 'usage' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { title: 'How assessment works', slug: 'concepts/assessment' },
      { title: 'Multi-model assessment', slug: 'concepts/multi-model' },
      { title: 'Reassessment', slug: 'concepts/reassessment' },
      { title: 'Evaluation criteria', slug: 'concepts/evaluation' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Submit your first assessment', slug: 'guides/first-assessment' },
      { title: 'Handle asynchronous results', slug: 'guides/async-assessments' },
      { title: 'Configure webhooks', slug: 'guides/webhooks' },
      { title: 'Handle errors', slug: 'guides/errors' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'API endpoints', slug: 'reference/endpoints' },
      { title: 'Request parameters', slug: 'reference/parameters' },
      { title: 'Response objects', slug: 'reference/responses' },
      { title: 'Error codes', slug: 'errors' },
      { title: 'Rate limits', slug: 'rate-limits' },
    ],
  },
  {
    title: 'Research',
    items: [
      { title: 'Methodology', slug: 'research/methodology' },
      { title: 'Evaluation framework', slug: 'research/evaluation-framework' },
    ],
  },
];

const order: string[] = docsNav.flatMap((group) => group.items.map((item) => item.slug));

export function getDocPage(slug: string): DocPage | undefined {
  return docsPages.find((page) => page.slug === slug);
}

export function getSiblings(slug: string): { previous?: DocPage; next?: DocPage } {
  const index = order.indexOf(slug);
  if (index === -1) return {};
  return {
    previous: index > 0 ? getDocPage(order[index - 1]) : undefined,
    next: index < order.length - 1 ? getDocPage(order[index + 1]) : undefined,
  };
}
