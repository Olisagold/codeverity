import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'quiet';

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  to?: string;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

const variants: Record<Variant, string> = {
  primary: 'bg-white text-black hover:bg-muted',
  secondary: 'border border-line-strong bg-transparent text-white hover:border-white/60',
  quiet: 'text-muted hover:text-white',
};

export function Button({ children, href, to, variant = 'primary', className = '', onClick }: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link href={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
