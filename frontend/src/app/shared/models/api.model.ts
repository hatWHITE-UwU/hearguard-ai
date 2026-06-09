/** Shared API response types — eliminates `any` in HTTP calls. */

export interface NoiseRecord {
  _id: string;
  dbLevel: number;
  riskTag: string;
  recordedAt: string;
  source?: string;
}

export interface FrequencyScore {
  hz: number;
  score: number;
  ear: 'left' | 'right';
}

export interface EvaluationItem {
  _id: string;
  overallScore: number;
  takenAt: string;
  status: string;
  frequencyScores?: FrequencyScore[];
}

export interface RiskResult {
  riskScore: number;
  riskLevel: string;
  yearsEstimated?: number;
  topFactors?: string[];
  recommendations?: string[];
}

export interface EvaluationDetail {
  evaluation: EvaluationItem;
  riskResult?: RiskResult;
}

export interface EvaluationCreate {
  evaluation: EvaluationItem;
  riskResult?: RiskResult;
  recommendations?: string[];
}

export interface NoiseStats {
  avgDb: number;
  maxDb: number;
  count: number;
  exposureMinutes: number;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
}

export interface Device {
  _id: string;
  name: string;
  type: 'arduino' | 'esp32' | 'other';
  hardwareId?: string;
  firmwareVersion?: string;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
}
