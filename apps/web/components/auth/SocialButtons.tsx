import React from 'react';
import { GithubIcon } from 'lucide-react';
import { API_URL } from '@/lib/auth/session';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.28a12 12 0 0 0 0 10.74l4-3.09Z" />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.28 6.63l4 3.09C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

interface SocialButtonsProps {
  action: string;
}

export function SocialButtons({ action }: SocialButtonsProps) {
  const classes =
    'flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface text-[14px] font-medium text-white transition-colors duration-150 ease-out hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black';

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <a href={`${API_URL}/v1/auth/google/login`} className={classes}>
        <GoogleIcon />
        {action} with Google
      </a>
      <button type="button" disabled className={`${classes} cursor-not-allowed opacity-50`}>
        <GithubIcon aria-hidden="true" className="h-4 w-4" />
        {action} with GitHub
      </button>
    </div>
  );
}
