/** Browser-side fetch for the dashboard's /api proxy routes. */

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
    cache: 'no-store',
  });

  if (response.status === 401) {
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // FastAPI validation errors send `detail` as a list; show the first message.
    const detail =
      typeof data.detail === 'string'
        ? data.detail
        : Array.isArray(data.detail) && typeof data.detail[0]?.msg === 'string'
          ? data.detail[0].msg
          : 'Something went wrong. Please try again.';
    throw new ApiError(detail, response.status);
  }
  return data as T;
}

export function query(params: Record<string, string | number | null | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '' && value !== 'all') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}
