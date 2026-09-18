import React from 'react';

/**
 * Lightweight, dependency-free tokeniser for the docs and dashboard code blocks.
 *
 * Token colours live in `app/globals.css` under the `.tok-*` classes so the whole
 * theme can be tuned in one place. The tokeniser is deliberately language-agnostic:
 * it covers the shell, HTTP, JSON, JavaScript and Python samples in the docs.
 */

type TokenKind =
  | 'comment'
  | 'string'
  | 'property'
  | 'number'
  | 'literal'
  | 'keyword'
  | 'method'
  | 'flag'
  | 'variable'
  | 'function'
  | 'type'
  | 'url'
  | 'punctuation'
  | 'operator';

const KEYWORDS = new Set([
  // JavaScript / TypeScript
  'const', 'let', 'var', 'await', 'async', 'function', 'return', 'import', 'export', 'from', 'default', 'new', 'class',
  'extends', 'try', 'catch', 'finally', 'throw', 'if', 'else', 'for', 'while', 'of', 'in', 'switch', 'case', 'break',
  'continue', 'typeof', 'instanceof', 'this', 'yield', 'interface', 'type', 'enum', 'implements',
  // Python
  'def', 'not', 'and', 'or', 'is', 'lambda', 'with', 'as', 'pass', 'raise', 'except', 'elif', 'print', 'global',
  // Shell
  'curl', 'export', 'echo', 'npm', 'npx', 'pnpm', 'yarn', 'pip', 'node', 'python', 'bun',
]);

const LITERALS = new Set(['null', 'undefined', 'true', 'false', 'None', 'True', 'False', 'NaN', 'Infinity']);

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

const PATTERN = new RegExp(
  [
    // 1: comment
    '(#(?![0-9a-fA-F]{3,8}\\b)[^\\n]*|//[^\\n]*|/\\*[\\s\\S]*?\\*/)',
    // 2: string
    '("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',
    // 3: url
    '(https?://[^\\s"\'`<>)]+)',
    // 4: leading boundary + 5: CLI flag
    '(^|[\\s(\\[])(--?[a-zA-Z][\\w-]*)',
    // 6: shell / template variable
    '(\\$\\{?[A-Za-z_][\\w]*\\}?)',
    // 7: number
    '(\\b\\d+(?:\\.\\d+)?(?:ms|s|m|h|d|%)?\\b)',
    // 8: word
    '(\\b[A-Za-z_][\\w]*\\b)',
    // 9: operator
    '(=>|===|!==|==|!=|<=|>=|&&|\\|\\||[+\\-*/%=<>!?&|^~])',
    // 10: punctuation
    '([{}\\[\\]();,.:\\\\])',
  ].join('|'),
  'g'
);

interface Groups {
  comment?: string;
  string?: string;
  url?: string;
  flagPrefix?: string;
  flag?: string;
  variable?: string;
  number?: string;
  word?: string;
  operator?: string;
  punctuation?: string;
}

function toGroups(match: RegExpExecArray): Groups {
  return {
    comment: match[1],
    string: match[2],
    url: match[3],
    flagPrefix: match[4],
    flag: match[5],
    variable: match[6],
    number: match[7],
    word: match[8],
    operator: match[9],
    punctuation: match[10],
  };
}

const CLASS_NAMES: Record<TokenKind, string> = {
  comment: 'tok-comment',
  string: 'tok-string',
  property: 'tok-property',
  number: 'tok-number',
  literal: 'tok-literal',
  keyword: 'tok-keyword',
  method: 'tok-method',
  flag: 'tok-flag',
  variable: 'tok-variable',
  function: 'tok-function',
  type: 'tok-type',
  url: 'tok-url',
  punctuation: 'tok-punctuation',
  operator: 'tok-operator',
};

function classify(groups: Groups, code: string, end: number): TokenKind | null {
  if (groups.comment) return 'comment';
  if (groups.string) {
    // "key": value  → treat as an object property rather than a plain string.
    return /^\s*:(?!:)/.test(code.slice(end, end + 4)) ? 'property' : 'string';
  }
  if (groups.url) return 'url';
  if (groups.flag) return 'flag';
  if (groups.variable) return 'variable';
  if (groups.number) return 'number';
  if (groups.operator) return 'operator';
  if (groups.punctuation) return 'punctuation';

  const word = groups.word;
  if (word) {
    if (HTTP_METHODS.has(word)) return 'method';
    if (LITERALS.has(word)) return 'literal';
    if (KEYWORDS.has(word)) return 'keyword';
    if (/^\s*\(/.test(code.slice(end, end + 2))) return 'function';
    if (/^[A-Z][A-Za-z0-9]+$/.test(word) && !/^[A-Z0-9_]+$/.test(word)) return 'type';
    if (/^\s*[:=](?!=)/.test(code.slice(end, end + 3)) && !/^\s*:\/\//.test(code.slice(end, end + 4))) return 'property';
  }
  return null;
}

/** Highlight a single line (or any snippet without meaningful line structure). */
export function highlight(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(code)) !== null) {
    const value = match[0];
    if (value.length === 0) {
      PATTERN.lastIndex += 1;
      continue;
    }
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index));

    const end = match.index + value.length;
    const groups = toGroups(match);
    const kind = classify(groups, code, end);

    if (kind === 'flag' && groups.flagPrefix) nodes.push(groups.flagPrefix);
    const tokenText = kind === 'flag' ? (groups.flag as string) : value;

    if (kind) {
      nodes.push(
        <span key={key++} className={CLASS_NAMES[kind]}>
          {tokenText}
        </span>
      );
    } else {
      nodes.push(value);
    }

    lastIndex = end;
  }

  if (lastIndex < code.length) nodes.push(code.slice(lastIndex));
  return nodes;
}

/** Highlight code line by line, so callers can attach gutters and line numbers. */
export function highlightLines(code: string): React.ReactNode[][] {
  return code.replace(/\n$/, '').split('\n').map((line) => highlight(line));
}
