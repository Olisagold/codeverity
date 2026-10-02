import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend';

// Dashboard resources the browser may reach through this proxy. Anything else
// under /v1 stays server side.
const ALLOWED = new Set(['dashboard', 'webhooks', 'logs', 'usage']);

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!ALLOWED.has(path[0])) {
    return NextResponse.json({ detail: 'Not found.' }, { status: 404 });
  }
  const target = `/v1/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const body = request.method === 'GET' || request.method === 'DELETE' ? undefined : await request.text();
  return proxyToBackend(request, target, { method: request.method, body: body || undefined });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
