import type { ApiKey } from '@/types/dashboard';
import { request } from '@/lib/api/client';
import { formatDate, formatRelative } from '@/lib/format';

export { ApiError as ApiKeyError } from '@/lib/api/client';

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

function toApiKey(data: ApiKeyResponse): ApiKey {
  return {
    id: data.id,
    name: data.name,
    masked: data.masked,
    environment: data.environment,
    description: data.description ?? '',
    lastUsed: formatRelative(data.last_used_at),
    created: formatDate(data.created_at),
    active: data.active,
  };
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
