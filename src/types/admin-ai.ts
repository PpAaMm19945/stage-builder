export interface AIOverviewResponse {
  overview: {
    total_calls: number;
    avg_latency: number;
    error_count: number;
    total_request_tokens: number;
    total_response_tokens: number;
  };
  topFeatures: { feature: string; count: number }[];
  startDate: string;
  days: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  feature: string;
  status: 'success' | 'error';
  latency_ms: number;
  request_tokens: number;
  response_tokens: number;
  model?: string;
  user_id?: string;
}

export interface TelemetryResponse {
  telemetry: TelemetryLog[];
}

export interface AnchorLog {
  date: string;
  data?: {
    theme?: string;
    [key: string]: unknown;
  };
  reasoning?: string;
  status: string;
  generated_at?: string;
}

export interface AnchorLogResponse {
  anchors: AnchorLog[];
}

export interface SpineStatsResponse {
  stats: Record<string, unknown>;
  pendingConflicts: unknown[];
}

export interface ActivityAnalysisResponse {
  totalAnalyzed: number;
  totalActivities: number;
  domainCounts: Record<string, number>;
  topMaterials: { name: string; count: number }[];
}

export interface SpineVersion {
  version: string;
  subjects: string | string[];
  status: string;
  totalWeeks: number;
  created_at?: string;
}

export interface SpineVersionsResponse {
  versions: SpineVersion[];
}

export interface SpineEntry {
  id: string;
  subject: string;
  weekNumber: number;
  stage: string;
  focusArea: string;
  skillTargets: string[];
  faithFraming?: string;
  approvedBy?: string;
}

export interface SpineEntriesResponse {
  version: string;
  entries: SpineEntry[];
}
