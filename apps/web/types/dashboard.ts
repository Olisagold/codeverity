export type AssessmentStatus = 'completed' | 'processing' | 'queued' | 'failed';

export interface ModelAssessment {
  name: string;
  model: string;
  score: number;
  issues: number;
  prescription: string;
}

export interface CriterionScore {
  label: string;
  value: number;
}

export interface Assessment {
  id: string;
  status: AssessmentStatus;
  language: string;
  score: number | null;
  confidence: number | null;
  processingSeconds: number | null;
  created: string;
  assignment: { title: string; requirements: string };
  code: string;
  models: ModelAssessment[];
  criteria: CriterionScore[];
  reassessmentSummary: string;
  finalSummary: string;
  recommendation: string;
}

export interface ApiKey {
  id: string;
  name: string;
  masked: string;
  environment: 'live' | 'test';
  description: string;
  lastUsed: string;
  created: string;
  requests: number;
  assessments: number;
  active: boolean;
}

export interface WebhookDelivery {
  id: string;
  event: string;
  status: number;
  time: string;
  request: string;
  response: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  active: boolean;
  events: string[];
  lastDelivery: string;
  deliveries: WebhookDelivery[];
}

export interface LogEntry {
  id: string;
  time: string;
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  status: number;
  duration: string;
  key: string;
}

export interface SeriesPoint {
  label: string;
  requests: number;
  assessments: number;
}
