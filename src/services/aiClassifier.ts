import { AISuggestion, HazardType } from '../types/database.types';

export interface AIAnalysisResult {
  suggestion: AISuggestion;
  executionTimeMs: number;
}

export async function analyzeHazardImage(file: File): Promise<AIAnalysisResult> {
  const startTime = Date.now();

  // Simulate network latency for assistive neural classification (600ms)
  await new Promise(resolve => setTimeout(resolve, 650));

  const fileName = file.name.toLowerCase();
  let suggestedHazard: HazardType = 'pothole';
  let confidence: 'high' | 'medium' | 'low' = 'high';
  let confidencePercentage = 89;
  let notes = 'Surface asphalt cavity detected with surrounding aggregate cracking.';
  const detectedFeatures: string[] = ['dark void', 'asphalt depression', 'fractured aggregate'];

  if (fileName.includes('signal') || fileName.includes('light') || fileName.includes('traffic')) {
    suggestedHazard = 'broken_traffic_signal';
    confidence = 'high';
    confidencePercentage = 93;
    notes = 'Overhead traffic signal head detected in dark / unpowered state.';
    detectedFeatures.length = 0;
    detectedFeatures.push('traffic signal housing', 'unlit optic lens', 'intersection pole');
  } else if (fileName.includes('water') || fileName.includes('flood') || fileName.includes('rain')) {
    suggestedHazard = 'waterlogging';
    confidence = 'high';
    confidencePercentage = 91;
    notes = 'Surface water reflections and submersion of lane boundary lines detected.';
    detectedFeatures.length = 0;
    detectedFeatures.push('water reflection', 'submerged lane marking', 'hydroplaning hazard');
  } else if (fileName.includes('dark') || fileName.includes('night') || fileName.includes('lamp')) {
    suggestedHazard = 'poor_street_lighting';
    confidence = 'medium';
    confidencePercentage = 79;
    notes = 'Low lux road corridor with failed luminaire illumination pattern.';
    detectedFeatures.length = 0;
    detectedFeatures.push('darkened roadway', 'missing street luminaire', 'low lux rating');
  } else if (fileName.includes('cross') || fileName.includes('zebra') || fileName.includes('pedestrian')) {
    suggestedHazard = 'unsafe_pedestrian_crossing';
    confidence = 'medium';
    confidencePercentage = 84;
    notes = 'Degraded or erased transverse pedestrian striping detected.';
    detectedFeatures.length = 0;
    detectedFeatures.push('faded thermoplastic paint', 'crosswalk path', 'pedestrian curb ramp');
  } else if (fileName.includes('tree') || fileName.includes('block') || fileName.includes('debris')) {
    suggestedHazard = 'obstruction';
    confidence = 'high';
    confidencePercentage = 95;
    notes = 'Physical blockage occupying drivable road surface.';
    detectedFeatures.length = 0;
    detectedFeatures.push('lane obstruction', 'foreign object', 'impeded vehicular path');
  }

  const suggestion: AISuggestion = {
    suggested_hazard: suggestedHazard,
    confidence,
    confidence_percentage: confidencePercentage,
    notes,
    detected_features: detectedFeatures,
    is_assistive: true
  };

  return {
    suggestion,
    executionTimeMs: Date.now() - startTime
  };
}
