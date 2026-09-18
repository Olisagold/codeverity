import React from 'react';
import Link from 'next/link';
import { Reveal } from '@/components/ui/Reveal';

export function FinalCta() {
  return (
    <section id="cta" className="bg-base">
      <div className="mx-auto max-w-shell px-6 pb-56 pt-28 sm:pb-72 sm:pt-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-[56px]">
            Start building with Codeverity
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted sm:text-[19px]">
            Go from first request to validated code feedback in minutes with one reliable API
          </p>
          <div className="mt-9 flex justify-center">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-[16px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Get Started
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
