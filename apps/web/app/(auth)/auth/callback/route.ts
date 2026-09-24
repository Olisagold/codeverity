import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_URL, setSessionCookies } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  let tokens: { access_token: string; refresh_token: string };
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
  setSessionCookies(redirect, tokens);
  return redirect;
}
