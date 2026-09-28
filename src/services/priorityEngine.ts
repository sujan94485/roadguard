import { PriorityBreakdown, PriorityLevel } from '../types/database.types';
import { PriorityEvaluationInput, PriorityScoreResult } from '../types/priority.types';

export function calculateHazardPriority(input: PriorityEvaluationInput): PriorityScoreResult {
  const factors: PriorityScoreResult['factors'] = [];

  // 1. Severity Score (Max: 35)
  let severityScore = 0;
  let severityDetail = '';
  switch (input.severity) {
    case 'minor':
      severityScore = 10;
      severityDetail = 'Minor road surface or fixture flaw; low risk to vehicle handling';
      break;
    case 'moderate':
      severityScore = 20;
      severityDetail = 'Moderate defect causing driver hesitation or minor vehicular vibration';
      break;
    case 'severe':
      severityScore = 30;
      severityDetail = 'Severe road hazard posing immediate tire blowout or structural wheel damage';
      break;
    case 'catastrophic':
      severityScore = 35;
      severityDetail = 'Catastrophic hazard (sinkhole, collapsed guardrail, downed power line) posing critical danger';
      break;
  }

  // Contextual hazard adjustment
  if (input.hazard_type === 'broken_traffic_signal' && severityScore >= 20) {
    severityScore = Math.min(35, severityScore + 5);
    severityDetail += ' + Uncontrolled junction signal bonus';
  } else if (input.hazard_type === 'waterlogging' && severityScore >= 20) {
    severityScore = Math.min(35, severityScore + 3);
    severityDetail += ' + Aquaplaning risk bonus';
  }

  factors.push({
    factor: 'Hazard Severity',
    score: severityScore,
    maxScore: 35,
    detail: severityDetail,
    rationale: `Evaluates acute physical danger: ${input.severity.toUpperCase()} defect.`
  });

  // 2. Traffic Exposure Score (Max: 25)
  let trafficScore = 0;
  let trafficDetail = '';
  switch (input.traffic_exposure) {
    case 'low':
      trafficScore = 5;
      trafficDetail = 'Residential alleyway / cul-de-sac with minimal daily vehicle counts';
      break;
    case 'medium':
      trafficScore = 15;
      trafficDetail = 'Secondary neighborhood collector street with steady local traffic';
      break;
    case 'high':
      trafficScore = 20;
      trafficDetail = 'Multi-lane commercial avenue with dense transit and freight movement';
      break;
    case 'arterial':
      trafficScore = 25;
      trafficDetail = 'High-speed arterial highway / flyover ramp with maximum collision velocity';
      break;
  }

  factors.push({
    factor: 'Traffic Exposure',
    score: trafficScore,
    maxScore: 25,
    detail: trafficDetail,
    rationale: `Quantifies vehicular volume and speed on ${input.traffic_exposure} corridor.`
  });

  // 3. Pedestrian & Civic Vulnerability Score (Max: 20)
  let vulnScore = 0;
  let vulnDetail = '';
  switch (input.vulnerability_level) {
    case 'standard':
      vulnScore = 5;
      vulnDetail = 'Standard roadway profile with baseline sidewalk pedestrian flow';
      break;
    case 'transit_hub':
      vulnScore = 12;
      vulnDetail = 'Metro station / bus depot perimeter with high foot traffic';
      break;
    case 'hospital_zone':
      vulnScore = 16;
      vulnDetail = 'Hospital / medical clinic route requiring unobstructed emergency vehicle access';
      break;
    case 'school_zone':
      vulnScore = 20;
      vulnDetail = 'School zone / playground crossing with vulnerable children & pedestrians';
      break;
  }

  factors.push({
    factor: 'Civic Vulnerability Zone',
    score: vulnScore,
    maxScore: 20,
    detail: vulnDetail,
    rationale: `Weights presence of vulnerable road users (${input.vulnerability_level.replace('_', ' ')}).`
  });

  // 4. Spatial Cluster Frequency Score (Max: 10)
  const clusterCount = input.existing_cluster_count || 0;
  let clusterScore = 0;
  let clusterDetail = '';
  if (clusterCount <= 0) {
    clusterScore = 0;
    clusterDetail = 'Single standalone citizen report';
  } else if (clusterCount <= 2) {
    clusterScore = 5;
    clusterDetail = `${clusterCount} corroborating citizen report(s) within 150m radius`;
  } else {
    clusterScore = 10;
    clusterDetail = `Persistent hazard cluster (${clusterCount}+ reports in same 150m segment)`;
  }

  factors.push({
    factor: 'Spatial Cluster Frequency',
    score: clusterScore,
    maxScore: 10,
    detail: clusterDetail,
    rationale: 'Verifies community corroboration and geographic defect concentration.'
  });

  // 5. Resolution Aging Score (Max: 10)
  let ageScore = 0;
  let ageDetail = 'Freshly submitted within 24 hours';
  if (input.created_at) {
    const elapsedMs = Date.now() - new Date(input.created_at).getTime();
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

    if (elapsedDays > 7) {
      ageScore = 10;
      ageDetail = `Unresolved for > 7 days (${elapsedDays.toFixed(1)} days overdue)`;
    } else if (elapsedDays > 3) {
      ageScore = 6;
      ageDetail = `Unresolved for 3-7 days (${elapsedDays.toFixed(1)} days pending)`;
    } else if (elapsedDays > 1) {
      ageScore = 3;
      ageDetail = `Unresolved for 1-3 days (${elapsedDays.toFixed(1)} days in queue)`;
    }
  }

  factors.push({
    factor: 'Resolution Aging',
    score: ageScore,
    maxScore: 10,
    detail: ageDetail,
    rationale: 'Escalates unresolved hazards that exceed standard municipal SLAs.'
  });

  // Total Score Calculation
  const totalScore = Math.min(100, Math.max(0, severityScore + trafficScore + vulnScore + clusterScore + ageScore));

  // Determine Level
  let level: PriorityLevel;
  if (totalScore >= 85) {
    level = 'critical';
  } else if (totalScore >= 65) {
    level = 'high';
  } else if (totalScore >= 40) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    score: Number(totalScore.toFixed(1)),
    level,
    factors
  };
}

export function createPriorityBreakdown(input: PriorityEvaluationInput): PriorityBreakdown {
  const evaluated = calculateHazardPriority(input);
  return {
    total_score: evaluated.score,
    priority_level: evaluated.level,
    calculated_at: new Date().toISOString(),
    factors: evaluated.factors
  };
}

/**
 * Re-evaluates aging penalty for existing records so overdue hazards escalate dynamically.
 * For resolved hazards, aging is frozen at resolution time.
 */
export function recalculateDynamicPriority<T extends {
  hazard_type: any;
  severity: any;
  traffic_exposure: any;
  vulnerability_level: any;
  created_at: string;
  status: any;
  resolved_at?: string | null;
  priority_score: number;
  priority_level: PriorityLevel;
  priority_breakdown: PriorityBreakdown;
}>(report: T, clusterCount = 0): T {
  // If report is already resolved, do not escalate aging further
  const effectiveTimestamp = report.status === 'resolved' && report.resolved_at
    ? report.resolved_at
    : report.created_at;

  const result = calculateHazardPriority({
    hazard_type: report.hazard_type,
    severity: report.severity,
    traffic_exposure: report.traffic_exposure,
    vulnerability_level: report.vulnerability_level,
    existing_cluster_count: clusterCount,
    created_at: effectiveTimestamp
  });

  return {
    ...report,
    priority_score: result.score,
    priority_level: result.level,
    priority_breakdown: {
      total_score: result.score,
      priority_level: result.level,
      calculated_at: new Date().toISOString(),
      factors: result.factors
    }
  };
}

