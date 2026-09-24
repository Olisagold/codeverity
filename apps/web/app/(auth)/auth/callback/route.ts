import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  API_URL,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/auth/session';

interface TokenPair {
  access_token: string;
  refresh_token: string;
}


export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  let tokens: TokenPair;
  try {
    const response = await fetch(`${API_URL}/v1/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      cache: 'no-store',
    });
    if (!response.ok) {
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }
    tokens = await response.json();
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
  redirect.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  redirect.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  return redirect;
}
