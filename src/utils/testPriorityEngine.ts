import { calculateHazardPriority } from '../services/priorityEngine';

export function runPriorityEngineTests() {
  console.log('--- Running Road Hazard Priority Engine Tests ---');

  // Test 1: Minimum possible score
  const minResult = calculateHazardPriority({
    hazard_type: 'pothole',
    severity: 'minor',
    traffic_exposure: 'low',
    vulnerability_level: 'standard',
    existing_cluster_count: 0
  });
  console.assert(minResult.score === 20, `Expected 20, got ${minResult.score}`);
  console.assert(minResult.level === 'low', `Expected 'low', got ${minResult.level}`);
  console.log('✓ Test 1 Passed: Minimum score = 20.0 (LOW)');

  // Test 2: Maximum possible score
  const maxResult = calculateHazardPriority({
    hazard_type: 'broken_traffic_signal',
    severity: 'catastrophic',
    traffic_exposure: 'arterial',
    vulnerability_level: 'school_zone',
    existing_cluster_count: 5,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  });
  console.assert(maxResult.score === 100, `Expected 100, got ${maxResult.score}`);
  console.assert(maxResult.level === 'critical', `Expected 'critical', got ${maxResult.level}`);
  console.log('✓ Test 2 Passed: Maximum score = 100.0 (CRITICAL)');

  // Test 3: Threshold check for HIGH priority
  const highResult = calculateHazardPriority({
    hazard_type: 'pothole',
    severity: 'severe', // 30
    traffic_exposure: 'arterial', // 25
    vulnerability_level: 'school_zone', // 20
    existing_cluster_count: 0
  });
  console.assert(highResult.score === 75, `Expected 75, got ${highResult.score}`);
  console.assert(highResult.level === 'high', `Expected 'high', got ${highResult.level}`);
  console.log('✓ Test 3 Passed: Severe + Arterial + School Zone = 75.0 (HIGH)');

  console.log('--- All Priority Engine Tests Passed Successfully ---');
}
