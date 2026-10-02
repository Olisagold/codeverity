import React from 'react';
import Link from 'next/link';

const RICH = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(RICH).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-medium text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          return (
            <Link
              key={index}
              href={link[2]}
              className="text-white underline decoration-accent underline-offset-4 transition-colors duration-150 hover:text-accent"
            >
              {link[1]}
            </Link>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

/** Renders text with `inline code`, **bold**, and [links](/path). */
export function InlineText({ text }: { text: string }) {
  const parts = text.split('`');

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[12.5px] text-white">
            {part}
          </code>
        ) : (
          <Rich key={index} text={part} />
        )
      )}
    </>
  );
}
