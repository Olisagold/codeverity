import React from 'react';
import { Eyebrow } from './Eyebrow';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <Reveal className={`${isCenter ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow ? <Eyebrow className={isCenter ? 'justify-center' : ''}>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.02em] text-white sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-[15px] leading-relaxed text-muted">{description}</p> : null}
    </Reveal>
  );
}
