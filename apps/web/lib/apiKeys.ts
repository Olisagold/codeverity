import type { ApiKey } from '@/types/dashboard';

/** Shape returned by the backend's /v1/api-keys endpoints. */
interface ApiKeyResponse {
  id: string;
  name: string;
  description: string | null;
  environment: 'live' | 'test';
  masked: string;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface ApiKeyCreatedResponse extends ApiKeyResponse {
  key: string;
}

export class ApiKeyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatRelative(iso: string | null) {
  if (!iso) return 'Never';
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

function toApiKey(data: ApiKeyResponse): ApiKey {
  return {
    id: data.id,
    name: data.name,
    masked: data.masked,
    environment: data.environment,
    description: data.description ?? '',
    lastUsed: formatRelative(data.last_used_at),
    created: formatDate(data.created_at),
    // Per-key usage isn't tracked yet.
    requests: 0,
    assessments: 0,
    active: data.active,
  };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    cache: 'no-store',
  });

  if (response.status === 401) {
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiKeyError('Your session has expired. Please sign in again.', 401);
  }
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : 'Something went wrong. Please try again.';
    throw new ApiKeyError(detail, response.status);
  }
  return data as T;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const data = await request<ApiKeyResponse[]>('/api/api-keys');
  return data.map(toApiKey);
}

export async function getApiKey(id: string): Promise<ApiKey> {
  return toApiKey(await request<ApiKeyResponse>(`/api/api-keys/${encodeURIComponent(id)}`));
}

export async function createApiKey(input: {
  name: string;
  environment: 'live' | 'test';
  description?: string;
}): Promise<{ apiKey: ApiKey; secret: string }> {
  const data = await request<ApiKeyCreatedResponse>('/api/api-keys', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return { apiKey: toApiKey(data), secret: data.key };
}

export async function revokeApiKey(id: string): Promise<void> {
  await request<void>(`/api/api-keys/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
