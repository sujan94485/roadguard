import { HazardType, PriorityLevel, ReportRecord, ReportStatus, SeverityLevel, TrafficExposureLevel, VulnerabilityZone } from './database.types';

export interface HazardCategoryMeta {
  type: HazardType;
  label: string;
  description: string;
  iconName: string;
  color: string;
}

export const HAZARD_CATEGORIES: HazardCategoryMeta[] = [
  {
    type: 'pothole',
    label: 'Pothole',
    description: 'Depression or cavity in asphalt causing tire damage or loss of vehicle control.',
    iconName: 'AlertCircle',
    color: '#F59E0B'
  },
  {
    type: 'broken_traffic_signal',
    label: 'Broken Traffic Signal',
    description: 'Blackout, flashing unmanaged signal, or damaged traffic light head.',
    iconName: 'TrafficCone',
    color: '#EF4444'
  },
  {
    type: 'poor_street_lighting',
    label: 'Poor Street Lighting',
    description: 'Unlit roadway section, dark intersection, or failed luminaire pole.',
    iconName: 'LightbulbOff',
    color: '#8B5CF6'
  },
  {
    type: 'unsafe_pedestrian_crossing',
    label: 'Unsafe Pedestrian Crossing',
    description: 'Faded zebra crossing, missing refuge island, or blocked pedestrian ramp.',
    iconName: 'Footprints',
    color: '#06B6D4'
  },
  {
    type: 'road_damage',
    label: 'Road Damage',
    description: 'Subsidence, surface heave, severe alligator cracking, or shoulder collapse.',
    iconName: 'Wrench',
    color: '#F97316'
  },
  {
    type: 'waterlogging',
    label: 'Waterlogging',
    description: 'Severe standing water, blocked storm drain, or hydroplaning hazard.',
    iconName: 'Waves',
    color: '#3B82F6'
  },
  {
    type: 'obstruction',
    label: 'Obstruction',
    description: 'Fallen tree limb, construction debris, loose cargo, or illegal barrier.',
    iconName: 'Barrier',
    color: '#EC4899'
  },
  {
    type: 'other',
    label: 'Other Safety Hazard',
    description: 'Other verified safety hazard requiring municipal inspection.',
    iconName: 'ShieldAlert',
    color: '#64748B'
  }
];

export interface ReportFilterOptions {
  searchQuery: string;
  hazardType: HazardType | 'all';
  priorityLevel: PriorityLevel | 'all';
  status: ReportStatus | 'all';
  sortBy: 'priority_score_desc' | 'created_at_desc' | 'created_at_asc';
}

export interface NewReportInput {
  hazard_type: HazardType;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  severity: SeverityLevel;
  traffic_exposure: TrafficExposureLevel;
  vulnerability_level: VulnerabilityZone;
  image_file?: File | null;
  image_preview?: string | null;
  user_name?: string;
  ai_suggestion?: ReportRecord['ai_suggestion'];
}
