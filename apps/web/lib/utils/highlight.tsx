import React from 'react';

const PATTERN = new RegExp(
  [
    '(#[^\\n]*|//[^\\n]*)',
    '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')',
    '\\b(\\d+(?:\\.\\d+)?)\\b',
    '\\b(curl|const|let|await|async|function|return|import|from|def|if|not|for|in|None|True|False|null|true|false|new|class|try|except)\\b',
    '\\b(GET|POST|DELETE|PUT|PATCH)\\b',
  ].join('|'),
  'g'
);

/** Lightweight, dependency-free token colouring for the docs code blocks. */
export function highlight(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  PATTERN.lastIndex = 0;
  while ((match = PATTERN.exec(code)) !== null) {
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index));

    const [value, comment, string, num, keyword, method] = match;
    if (comment) {
      nodes.push(
        <span key={key++} className="text-faint">
          {value}
        </span>
      );
    } else if (string) {
      nodes.push(
        <span key={key++} className="text-accent">
          {value}
        </span>
      );
    } else if (num) {
      nodes.push(
        <span key={key++} className="text-violet">
          {value}
        </span>
      );
    } else if (keyword || method) {
      nodes.push(
        <span key={key++} className="text-white">
          {value}
        </span>
      );
    } else {
      nodes.push(value);
    }

    lastIndex = match.index + value.length;
  }

  if (lastIndex < code.length) nodes.push(code.slice(lastIndex));
  return nodes;
}
