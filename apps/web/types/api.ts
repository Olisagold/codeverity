/** Response shapes from the Codeverity API, as returned (snake_case). */

export type Environment = 'live' | 'test';
export type AssessmentStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type Range = '7d' | '30d' | '90d';

export interface Session {
  user: { id: string; name: string; email: string; has_password: boolean };
  organization: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    members: { name: string; email: string }[];
  };
}

/** Which getting started steps the organization has done. */
export interface Quickstart {
  api_key: boolean;
  assessment: boolean;
  webhook: boolean;
  result_viewed: boolean;
  first_completed_assessment_id: string | null;
  dismissed: boolean;
}

export interface AssessmentSummary {
  id: string;
  status: AssessmentStatus;
  environment: Environment;
  language: string;
  title: string;
  score: number | null;
  confidence: number | null;
  rubric_score: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface AssessmentPage {
  data: AssessmentSummary[];
  next_cursor: string | null;
  languages: string[];
}

export interface Feedback {
  summary: string;
  issues: string[];
  suggestions: string[];
}

export interface RubricScore {
  name: string;
  weight: number;
  score: number;
  comment: string;
}

export interface ModelResult {
  provider: string;
  model: string | null;
  status: string;
  latency_ms: number | null;
  error: string | null;
  summary: string | null;
  issues: string[];
  suggestions: string[];
  criteria: Record<string, number> | null;
}

export interface AssessmentDetail extends AssessmentSummary {
  assignment_requirements: string;
  code: string;
  rubric: {
    criteria: { name: string; description: string; weight: number }[];
    learner_level?: string | null;
    notes?: string | null;
  } | null;
  criteria: Record<string, number> | null;
  feedback: (Feedback & { simulated?: boolean }) | null;
  rubric_scores: RubricScore[] | null;
  models: ModelResult[];
  reviewer_model: string | null;
  processing_seconds: number | null;
  error_code: string | null;
  error_message: string | null;
}

export interface KeyRef {
  id: string;
  name: string;
}

export interface LogEntry {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  status: number;
  duration_ms: number;
  environment: Environment;
  api_key: KeyRef | null;
  created_at: string;
}

export interface LogPage {
  data: LogEntry[];
  next_cursor: string | null;
}

export interface Usage {
  range: Range;
  environment: Environment | null;
  totals: {
    requests: number;
    assessments: number;
    completed: number;
    failed: number;
    avg_processing_seconds: number | null;
  };
  series: { date: string; requests: number; assessments: number }[];
  by_key: { api_key: KeyRef | null; requests: number; assessments: number }[];
}

export type WebhookEvent = 'assessment.completed' | 'assessment.failed';

export interface Webhook {
  id: string;
  url: string;
  environment: Environment;
  description: string | null;
  events: WebhookEvent[];
  active: boolean;
  created_at: string;
  last_delivery_at: string | null;
}

export interface WebhookWithSecret extends Webhook {
  secret: string;
}

export interface Delivery {
  id: string;
  event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'succeeded' | 'failed';
  attempts: number;
  last_status_code: number | null;
  last_error: string | null;
  created_at: string;
  delivered_at: string | null;
}
