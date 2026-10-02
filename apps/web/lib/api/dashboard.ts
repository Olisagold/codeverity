import { query, request } from '@/lib/api/client';
import type {
  AssessmentDetail,
  AssessmentPage,
  Delivery,
  Environment,
  LogEntry,
  LogPage,
  Range,
  Session,
  Usage,
  Webhook,
  WebhookEvent,
  WebhookWithSecret,
} from '@/types/api';

const id = encodeURIComponent;

// ── Session and organization ──────────────────────────────

export const getSession = () => request<Session>('/api/v1/dashboard/session');

export const updateOrganization = (input: { name?: string; slug?: string }) =>
  request<Session>('/api/v1/dashboard/organization', { method: 'PATCH', body: JSON.stringify(input) });

export const changePassword = (input: { current_password?: string; new_password: string }) =>
  request<void>('/api/v1/dashboard/password', { method: 'POST', body: JSON.stringify(input) });

export async function signOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    // A full page load also drops the cached session in memory.
    window.location.replace('/login');
  }
}

// ── Assessments ───────────────────────────────────────────

export const listAssessments = (params: {
  status?: string;
  language?: string;
  environment?: string;
  range?: string;
  q?: string;
  limit?: number;
  before?: string | null;
}) => request<AssessmentPage>(`/api/v1/dashboard/assessments${query(params)}`);

export const getAssessment = (assessmentId: string) =>
  request<AssessmentDetail>(`/api/v1/dashboard/assessments/${id(assessmentId)}`);

// ── Usage and logs ────────────────────────────────────────

export const getUsage = (range: Range, environment?: Environment | 'all') =>
  request<Usage>(`/api/v1/usage${query({ range, environment })}`);

export const listLogs = (params: {
  status?: string;
  method?: string;
  environment?: string;
  api_key_id?: string;
  limit?: number;
  before?: string | null;
}) => request<LogPage>(`/api/v1/logs${query(params)}`);

export const getLog = (logId: string) => request<LogEntry>(`/api/v1/logs/${id(logId)}`);

// ── Webhooks ──────────────────────────────────────────────

export const listWebhooks = () => request<Webhook[]>('/api/v1/webhooks');

export const getWebhook = (webhookId: string) => request<Webhook>(`/api/v1/webhooks/${id(webhookId)}`);

export const createWebhook = (input: {
  url: string;
  environment: Environment;
  events: WebhookEvent[];
  description?: string;
}) => request<WebhookWithSecret>('/api/v1/webhooks', { method: 'POST', body: JSON.stringify(input) });

export const updateWebhook = (
  webhookId: string,
  input: { url?: string; description?: string; events?: WebhookEvent[]; active?: boolean }
) => request<Webhook>(`/api/v1/webhooks/${id(webhookId)}`, { method: 'PATCH', body: JSON.stringify(input) });

export const deleteWebhook = (webhookId: string) =>
  request<void>(`/api/v1/webhooks/${id(webhookId)}`, { method: 'DELETE' });

export const rotateWebhookSecret = (webhookId: string) =>
  request<WebhookWithSecret>(`/api/v1/webhooks/${id(webhookId)}/rotate-secret`, { method: 'POST' });

export const sendTestEvent = (webhookId: string) =>
  request<Delivery>(`/api/v1/webhooks/${id(webhookId)}/test`, { method: 'POST' });

export const listDeliveries = (webhookId: string) =>
  request<Delivery[]>(`/api/v1/webhooks/${id(webhookId)}/deliveries`);
