import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, API_URL, REFRESH_TOKEN_COOKIE } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // Revoke both tokens server side. Best effort: the cookies are cleared either way.
  if (access || refresh) {
    try {
      await fetch(`${API_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refresh ?? null }),
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Backend unreachable: still sign the browser out.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
