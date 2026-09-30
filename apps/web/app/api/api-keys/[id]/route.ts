import type { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyToBackend(request, `/v1/api-keys/${encodeURIComponent(id)}`);
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyToBackend(request, `/v1/api-keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
