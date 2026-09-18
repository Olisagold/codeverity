export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export interface CodeSample {
  label: string;
  language: string;
  code: string;
}

export type DocBlock =
  | { type: 'heading'; id: string; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'code'; language: string; code: string; label?: string }
  | { type: 'tabs'; tabs: CodeSample[]; label?: string }
  | {
      type: 'endpoint';
      method: HttpMethod;
      path: string;
      description?: string;
      request: CodeSample[];
      response: string;
      status?: string;
    }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'diagram'; art: string; caption?: string }
  | { type: 'callout'; tone: 'info' | 'warning'; title?: string; text: string }
  | { type: 'cards'; cards: { title: string; text: string; to: string }[] }
  | { type: 'definitions'; items: { term: string; text: string }[] }
  | { type: 'custom'; component: 'playground' | 'apiKeys' | 'statusFlow' };

export interface DocPage {
  slug: string;
  section: string;
  title: string;
  description: string;
  blocks: DocBlock[];
}

export interface DocsNavGroup {
  title: string;
  items: { title: string; slug: string }[];
}
