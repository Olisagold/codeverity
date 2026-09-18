import React from 'react';
import {
  ActivityIcon,
  ClockIcon,
  KeyIcon,
  LayersIcon,
  MessageSquareIcon,
  ScaleIcon,
  TerminalIcon,
  WebhookIcon,
} from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { features, type Feature } from '@/lib/content';

const icons: Record<Feature['icon'], React.ComponentType<{ className?: string }>> = {
  layers: LayersIcon,
  scale: ScaleIcon,
  message: MessageSquareIcon,
  terminal: TerminalIcon,
  clock: ClockIcon,
  webhook: WebhookIcon,
  key: KeyIcon,
  activity: ActivityIcon,
};

export function Features() {
  return (
    <section id="features" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-24">
        <SectionHeading eyebrow="Features" title="Everything you need to integrate AI code assessment." />

        <Reveal className="mt-14 overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = icons[feature.icon];
              return (
                <article
                  key={feature.title}
                  className={`border-line p-6 ${index % 4 !== 3 ? 'lg:border-r' : ''} ${
                    index % 2 === 0 ? 'sm:border-r lg:border-r' : ''
                  } ${index < features.length - 1 ? 'border-b' : ''} ${
                    index >= features.length - 4 ? 'lg:border-b-0' : ''
                  } ${index >= features.length - 2 ? 'sm:border-b-0' : ''}`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-faint" />
                  <h3 className="mt-4 text-[15px] font-medium text-white">{feature.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-faint">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
