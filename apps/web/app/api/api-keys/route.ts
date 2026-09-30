import type { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api/backend';

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/v1/api-keys');
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/v1/api-keys', { method: 'POST', body: await request.text() });
}
