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

export interface SeriesPoint {
  label: string;
  requests: number;
  assessments: number;
}
