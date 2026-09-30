import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, API_URL } from '@/lib/auth/session';

/**
 * Forward a dashboard request to the Codeverity API with the session's access
 * token. The token lives in an httpOnly cookie, so the browser can't attach it
 * itself; these route handlers do it server-side.
 */
export async function proxyToBackend(request: NextRequest, path: string, init: RequestInit = {}) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated.' }, { status: 401 });
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await response.text();
  return new NextResponse(text || null, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  });
}
