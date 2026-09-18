import React from 'react';

/** Renders text with `inline code` spans marked using backticks. */
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
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
