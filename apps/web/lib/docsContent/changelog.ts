import type { DocPage } from '@/types/docs';

export const changelogPages: DocPage[] = [
  {
    slug: 'changelog',
    section: 'Updates',
    title: 'Changelog',
    description: 'What changed in the Codeverity API, dashboard and docs, newest first.',
    blocks: [
      {
        type: 'callout',
        tone: 'info',
        title: 'Coming next',
        text: 'API key authentication for the public API, followed by the assessments endpoint and the worker that runs the models.',
      },
      { type: 'custom', component: 'changelog' },
    ],
  },
];
