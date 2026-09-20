import React from 'react';
import { highlightLines } from '@/lib/utils/highlight';

interface CodePreProps {
  code: string;
  /** Show a line-number gutter. Off by default. */
  lineNumbers?: boolean;
  className?: string;
}

/**
 * The single source of truth for how code is rendered across docs and dashboard.
 * Theme colours and gutter styling live in `app/globals.css` (`.code-pre`, `.tok-*`).
 */
export function CodePre({ code, lineNumbers, className = '' }: CodePreProps) {
  const lines = highlightLines(code);
  const showNumbers = lineNumbers ?? false;

  return (
    <pre className={`code-pre ${showNumbers ? 'code-pre--numbered' : ''} ${className}`} tabIndex={0}>
      <code>
        {lines.map((tokens, index) => (
          <span key={index} className="code-line">
            {tokens.length ? tokens : ' '}
            {'\n'}
          </span>
        ))}
      </code>
    </pre>
  );
}
