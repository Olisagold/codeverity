import React from 'react';
import { Reveal } from '@/components/ui/Reveal';

const AUDIENCES = ['LMS platforms', 'Coding platforms', 'Universities', 'Bootcamps'];

export function TrustBar() {
  // Repeat the list so the track is wide enough to loop seamlessly.
  const track = [...AUDIENCES, ...AUDIENCES, ...AUDIENCES];

  return (
    <section aria-label="Who Codeverity is built for" className="border-b border-line-soft">
      <div className="mx-auto max-w-shell px-6 py-16">
        <Reveal>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            Built for the platforms that teach developers
          </p>
          <div className="marquee mt-10" role="list">
            <div className="marquee__track">
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1} className="marquee__group">
                  {track.map((audience, index) => (
                    <li key={`${copy}-${index}`} role="listitem" className="marquee__item">
                      {audience}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
