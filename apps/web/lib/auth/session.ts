import type { NextResponse } from 'next/server';

export const ACCESS_TOKEN_COOKIE = 'cv_access_token';
export const REFRESH_TOKEN_COOKIE = 'cv_refresh_token';

export const ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export function setSessionCookies(response: NextResponse, tokens: TokenPair) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, { ...options, maxAge: ACCESS_TOKEN_MAX_AGE });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, { ...options, maxAge: REFRESH_TOKEN_MAX_AGE });
}
