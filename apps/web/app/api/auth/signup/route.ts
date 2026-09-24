import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/auth/session';

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetch(`${API_URL}/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    cache: 'no-store',
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
