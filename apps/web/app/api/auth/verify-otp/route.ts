import { NextResponse } from 'next/server';
import { API_URL, setSessionCookies } from '@/lib/auth/session';

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${API_URL}/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const result = NextResponse.json({ ok: true });
  setSessionCookies(result, data);
  return result;
}
