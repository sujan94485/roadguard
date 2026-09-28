import { HazardType, PriorityLevel, SeverityLevel, TrafficExposureLevel, VulnerabilityZone } from './database.types';

export interface PriorityEvaluationInput {
  hazard_type: HazardType;
  severity: SeverityLevel;
  traffic_exposure: TrafficExposureLevel;
  vulnerability_level: VulnerabilityZone;
  existing_cluster_count?: number; // reports within 150m
  created_at?: string; // used for aging
}

export interface PriorityScoreResult {
  score: number;
  level: PriorityLevel;
  factors: {
    factor: string;
    score: number;
    maxScore: number;
    detail: string;
    rationale: string;
  }[];
}
