import type { DocPage } from '@/types/docs';

export const changelogPages: DocPage[] = [
  {
    slug: 'changelog',
    section: 'Updates',
    title: 'Changelog',
    description: 'Latest features, releases, and improvements.',
    blocks: [{ type: 'custom', component: 'changelog' }],
  },
];
