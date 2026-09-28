import { ReportRecord, ReportUpdateRecord } from '../types/database.types';
import { calculateHazardPriority } from '../services/priorityEngine';
import { DEFAULT_MAP_CENTER } from '../services/mapConfig';

export const DEMO_CENTER_COORDINATES: [number, number] = DEFAULT_MAP_CENTER;

/**
 * SAMPLE DEMONSTRATION DATA (FOR HACKATHON EVALUATION ONLY)
 * Geographically coherent mock data set in the Mysuru / Karnataka corridor.
 * These records are simulated and do NOT represent actual government data or real public works records.
 */
export const INITIAL_DEMO_REPORTS: (ReportRecord & { is_demo?: boolean })[] = [
  {
    id: 'demo-001',
    report_code: 'RG-2026-0012',
    user_id: 'demo-user-01',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'pothole',
    location_name: 'Near College Gate, SJCE / JSS Campus Road',
    latitude: 12.3130,
    longitude: 76.6135,
    description: 'Deep asphalt pothole (approx 10cm deep) right outside the college main gate. Two-wheeler riders and cyclists frequently swerve into oncoming traffic to dodge the depression.',
    severity: 'severe',
    traffic_exposure: 'high',
    vulnerability_level: 'school_zone',
    priority_score: 80.0,
    priority_level: 'high',
    priority_breakdown: {
      total_score: 80.0,
      priority_level: 'high',
      calculated_at: '2026-09-27T08:30:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'pothole',
        severity: 'severe',
        traffic_exposure: 'high',
        vulnerability_level: 'school_zone',
        existing_cluster_count: 2,
        created_at: '2026-09-27T08:30:00Z'
      }).factors
    },
    status: 'in_progress',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'pothole',
      confidence: 'high',
      confidence_percentage: 92,
      notes: 'Road surface cavity detected with surrounding aggregate cracking.',
      is_assistive: true
    },
    created_at: '2026-09-27T08:30:00Z',
    updated_at: '2026-09-28T09:15:00Z'
  },
  {
    id: 'demo-002',
    report_code: 'RG-2026-0014',
    user_id: 'demo-user-02',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'broken_traffic_signal',
    location_name: 'Hardinge Circle (Jayachamarajendra Circle) Intersection',
    latitude: 12.3075,
    longitude: 76.6598,
    description: 'Traffic signal completely blank following electrical trip. Heavy 4-way vehicular crossover with no signal regulation causing severe bottleneck and pedestrian crossing hazards.',
    severity: 'catastrophic',
    traffic_exposure: 'arterial',
    vulnerability_level: 'transit_hub',
    priority_score: 92.0,
    priority_level: 'critical',
    priority_breakdown: {
      total_score: 92.0,
      priority_level: 'critical',
      calculated_at: '2026-09-28T07:15:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'broken_traffic_signal',
        severity: 'catastrophic',
        traffic_exposure: 'arterial',
        vulnerability_level: 'transit_hub',
        existing_cluster_count: 3,
        created_at: '2026-09-28T07:15:00Z'
      }).factors
    },
    status: 'under_review',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'broken_traffic_signal',
      confidence: 'high',
      confidence_percentage: 91,
      notes: 'Signal head detected unlit during daytime hours.',
      is_assistive: true
    },
    created_at: '2026-09-28T07:15:00Z',
    updated_at: '2026-09-28T07:45:00Z'
  },
  {
    id: 'demo-003',
    report_code: 'RG-2026-0008',
    user_id: 'demo-user-03',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'poor_street_lighting',
    location_name: 'Saraswathipuram 5th Main Road, Near Park Approach',
    latitude: 12.3010,
    longitude: 76.6270,
    description: 'Four consecutive street luminaires are completely dark. Road is pitch black after 7 PM, creating hazardous pedestrian crossings and low night visibility for vehicles.',
    severity: 'moderate',
    traffic_exposure: 'medium',
    vulnerability_level: 'standard',
    priority_score: 56.0,
    priority_level: 'medium',
    priority_breakdown: {
      total_score: 56.0,
      priority_level: 'medium',
      calculated_at: '2026-09-20T21:00:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'poor_street_lighting',
        severity: 'moderate',
        traffic_exposure: 'medium',
        vulnerability_level: 'standard',
        existing_cluster_count: 1,
        created_at: '2026-09-20T21:00:00Z'
      }).factors
    },
    status: 'in_progress',
    image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'poor_street_lighting',
      confidence: 'medium',
      confidence_percentage: 78,
      notes: 'Low ambient roadway illumination pattern.',
      is_assistive: true
    },
    created_at: '2026-09-20T21:00:00Z',
    updated_at: '2026-09-26T14:30:00Z'
  },
  {
    id: 'demo-004',
    report_code: 'RG-2026-0005',
    user_id: 'demo-user-04',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'waterlogging',
    location_name: 'KR Hospital Junction, Sayyaji Rao Road approach',
    latitude: 12.3142,
    longitude: 76.6515,
    description: 'Heavy standing water accumulating across the entire left two lanes due to blocked roadside drain. Hospital ambulances and buses are experiencing severe transit slowdowns.',
    severity: 'severe',
    traffic_exposure: 'arterial',
    vulnerability_level: 'hospital_zone',
    priority_score: 84.0,
    priority_level: 'high',
    priority_breakdown: {
      total_score: 84.0,
      priority_level: 'high',
      calculated_at: '2026-09-26T10:00:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'waterlogging',
        severity: 'severe',
        traffic_exposure: 'arterial',
        vulnerability_level: 'hospital_zone',
        existing_cluster_count: 1,
        created_at: '2026-09-26T10:00:00Z'
      }).factors
    },
    status: 'submitted',
    image_url: 'https://images.unsplash.com/photo-1519074069444-1ba4eae16730?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'waterlogging',
      confidence: 'high',
      confidence_percentage: 92,
      notes: 'Extensive surface water pooling across roadway lanes.',
      is_assistive: true
    },
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-26T10:00:00Z'
  },
  {
    id: 'demo-005',
    report_code: 'RG-2026-0002',
    user_id: 'demo-user-05',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'unsafe_pedestrian_crossing',
    location_name: 'Devaraja Market Road near Dhanvantri Road cross',
    latitude: 12.3105,
    longitude: 76.6520,
    description: 'Zebra stripes faded and worn away after recent tarring. Pedestrians and shoppers crossing the busy market road have no marked right-of-way.',
    severity: 'moderate',
    traffic_exposure: 'high',
    vulnerability_level: 'transit_hub',
    priority_score: 63.0,
    priority_level: 'medium',
    priority_breakdown: {
      total_score: 63.0,
      priority_level: 'medium',
      calculated_at: '2026-09-18T12:00:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'unsafe_pedestrian_crossing',
        severity: 'moderate',
        traffic_exposure: 'high',
        vulnerability_level: 'transit_hub',
        existing_cluster_count: 0,
        created_at: '2026-09-18T12:00:00Z'
      }).factors
    },
    status: 'resolved',
    image_url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'unsafe_pedestrian_crossing',
      confidence: 'medium',
      confidence_percentage: 81,
      notes: 'Degraded pedestrian roadway markings.',
      is_assistive: true
    },
    created_at: '2026-09-18T12:00:00Z',
    updated_at: '2026-09-22T16:00:00Z',
    resolved_at: '2026-09-22T16:00:00Z'
  },
  {
    id: 'demo-006',
    report_code: 'RG-2026-0015',
    user_id: 'demo-user-06',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'road_damage',
    location_name: 'School Zone Crossing, Vijayanagar 2nd Stage Main Road',
    latitude: 12.3320,
    longitude: 76.6180,
    description: 'Severe road surface trenching left unpaved after underground utility pipe repair. Sharp asphalt edges causing sudden braking directly in front of school gate.',
    severity: 'severe',
    traffic_exposure: 'high',
    vulnerability_level: 'school_zone',
    priority_score: 85.0,
    priority_level: 'critical',
    priority_breakdown: {
      total_score: 85.0,
      priority_level: 'critical',
      calculated_at: '2026-09-28T11:00:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'road_damage',
        severity: 'severe',
        traffic_exposure: 'high',
        vulnerability_level: 'school_zone',
        existing_cluster_count: 1,
        created_at: '2026-09-28T11:00:00Z'
      }).factors
    },
    status: 'submitted',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'road_damage',
      confidence: 'high',
      confidence_percentage: 95,
      notes: 'Surface subsidence and broken asphalt edges.',
      is_assistive: true
    },
    created_at: '2026-09-28T11:00:00Z',
    updated_at: '2026-09-28T11:00:00Z'
  },
  {
    id: 'demo-007',
    report_code: 'RG-2026-0019',
    user_id: 'demo-user-07',
    user_name: 'Sample Citizen Reporter',
    hazard_type: 'obstruction',
    location_name: 'Mysuru-Bengaluru Highway Service Road near Mandya corridor',
    latitude: 12.3480,
    longitude: 76.6710,
    description: 'Unmarked gravel mound and construction barrier protruding 2 meters into the driving lane without warning reflectors.',
    severity: 'severe',
    traffic_exposure: 'arterial',
    vulnerability_level: 'standard',
    priority_score: 70.0,
    priority_level: 'high',
    priority_breakdown: {
      total_score: 70.0,
      priority_level: 'high',
      calculated_at: '2026-09-28T12:30:00Z',
      factors: calculateHazardPriority({
        hazard_type: 'obstruction',
        severity: 'severe',
        traffic_exposure: 'arterial',
        vulnerability_level: 'standard',
        existing_cluster_count: 0,
        created_at: '2026-09-28T12:30:00Z'
      }).factors
    },
    status: 'submitted',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ai_suggestion: {
      suggested_hazard: 'obstruction',
      confidence: 'high',
      confidence_percentage: 93,
      notes: 'Roadway obstruction obstructing active lane.',
      is_assistive: true
    },
    created_at: '2026-09-28T12:30:00Z',
    updated_at: '2026-09-28T12:30:00Z'
  }
];

export const INITIAL_DEMO_UPDATES: ReportUpdateRecord[] = [
  {
    id: 'demo-upd-001',
    report_id: 'demo-001',
    admin_id: 'demo-admin-01',
    admin_name: 'Demo Authority User',
    department: 'Municipal Road Maintenance Team',
    previous_status: 'submitted',
    new_status: 'under_review',
    comment: 'Sample maintenance note: Report photo verified. Pothole near college gate flagged for priority patch work.',
    created_at: '2026-09-27T10:15:00Z'
  },
  {
    id: 'demo-upd-002',
    report_id: 'demo-001',
    admin_id: 'demo-admin-01',
    admin_name: 'Demo Authority User',
    department: 'Municipal Road Maintenance Team',
    previous_status: 'under_review',
    new_status: 'in_progress',
    comment: 'Sample maintenance note: Road maintenance crew dispatched for cold-mix asphalt filling.',
    created_at: '2026-09-28T09:15:00Z'
  },
  {
    id: 'demo-upd-003',
    report_id: 'demo-002',
    admin_id: 'demo-admin-02',
    admin_name: 'Demo Authority User',
    department: 'Traffic Infrastructure Support',
    previous_status: 'submitted',
    new_status: 'under_review',
    comment: 'Sample maintenance note: Major circle signal blackout noted. Electrical inspection team dispatched for junction controller check.',
    created_at: '2026-09-28T07:45:00Z'
  },
  {
    id: 'demo-upd-004',
    report_id: 'demo-005',
    admin_id: 'demo-admin-01',
    admin_name: 'Demo Authority User',
    department: 'Municipal Road Maintenance Team',
    previous_status: 'in_progress',
    new_status: 'resolved',
    comment: 'Sample maintenance note: Thermoplastic pedestrian crossing repainted and verified. Issue closed.',
    created_at: '2026-09-22T16:00:00Z'
  }
];
