import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { CodeTabs } from './CodeTabs';
import { Callout } from './Callout';
import { Diagram } from './Diagram';
import { ParamTable } from './ParamTable';
import { EndpointCard } from './EndpointCard';
import { InlineText } from './InlineText';
import { TryCodeverity } from './TryCodeverity';
import { ApiKeysMock } from './ApiKeysMock';
import { StatusFlow } from './StatusFlow';
import type { DocBlock } from '@/types/docs';

function renderBlock(block: DocBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} id={block.id} className="scroll-mt-24 pt-6 text-[20px] font-medium tracking-[-0.01em] text-white">
          {block.text}
        </h2>
      );
    case 'subheading':
      return (
        <h3 key={index} className="pt-2 text-[15px] font-medium text-white">
          {block.text}
        </h3>
      );
    case 'paragraph':
      return (
        <p key={index} className="text-[14.5px] leading-[1.75] text-muted">
          <InlineText text={block.text} />
        </p>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag key={index} className={`space-y-2 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item) => (
            <li key={item} className="text-[14.5px] leading-[1.7] text-muted marker:text-faint">
              <InlineText text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'code':
      return <CodeBlock key={index} code={block.code} label={block.label ?? block.language} />;
    case 'tabs':
      return <CodeTabs key={index} tabs={block.tabs} />;
    case 'endpoint':
      return (
        <EndpointCard
          key={index}
          method={block.method}
          path={block.path}
          description={block.description}
          request={block.request}
          response={block.response}
          status={block.status}
        />
      );
    case 'table':
      return <ParamTable key={index} columns={block.columns} rows={block.rows} />;
    case 'diagram':
      return <Diagram key={index} art={block.art} caption={block.caption} />;
    case 'callout':
      return (
        <Callout key={index} tone={block.tone} title={block.title}>
          <InlineText text={block.text} />
        </Callout>
      );
    case 'definitions':
      return (
        <dl key={index} className="divide-y divide-line-soft rounded-xl border border-line">
          {block.items.map((item) => (
            <div key={item.term} className="px-4 py-4">
              <dt className="font-mono text-[12.5px] text-white">{item.term}</dt>
              <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                <InlineText text={item.text} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case 'cards':
      return (
        <div key={index} className="grid gap-3 sm:grid-cols-2">
          {block.cards.map((card) => (
            <Link
              key={card.title}
              href={card.to}
              className="group rounded-xl border border-line bg-surface p-4 transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <p className="flex items-center justify-between gap-2 text-[14px] font-medium text-white">
                {card.title}
                <ArrowRightIcon aria-hidden="true" className="h-3.5 w-3.5 text-faint" />
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-faint">{card.text}</p>
            </Link>
          ))}
        </div>
      );
    case 'custom':
      if (block.component === 'playground') return <TryCodeverity key={index} />;
      if (block.component === 'apiKeys') return <ApiKeysMock key={index} />;
      return <StatusFlow key={index} />;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks: DocBlock[] }) {
  return <div className="space-y-5">{blocks.map((block, index) => renderBlock(block, index))}</div>;
}
