import React from 'react';
import { HazardType } from '../../types/database.types';
import { HAZARD_CATEGORIES } from '../../types/report.types';
import {
  AlertCircle,
  TrafficCone,
  LightbulbOff,
  Footprints,
  Wrench,
  Waves,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface HazardTypeSelectorProps {
  selectedType: HazardType;
  onSelect: (type: HazardType) => void;
}

export const HazardTypeSelector: React.FC<HazardTypeSelectorProps> = ({ selectedType, onSelect }) => {
  const getIcon = (type: HazardType) => {
    switch (type) {
      case 'pothole':
        return <AlertCircle size={20} />;
      case 'broken_traffic_signal':
        return <TrafficCone size={20} />;
      case 'poor_street_lighting':
        return <LightbulbOff size={20} />;
      case 'unsafe_pedestrian_crossing':
        return <Footprints size={20} />;
      case 'road_damage':
        return <Wrench size={20} />;
      case 'waterlogging':
        return <Waves size={20} />;
      case 'obstruction':
        return <ShieldAlert size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
      {HAZARD_CATEGORIES.map(category => {
        const isSelected = selectedType === category.type;
        return (
          <div
            key={category.type}
            onClick={() => onSelect(category.type)}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: isSelected ? '2px solid #38BDF8' : '1px solid #1F2937',
              backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : '#111827',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  color: category.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getIcon(category.type)}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? '#38BDF8' : '#F1F5F9' }}>
                {category.label}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0, lineHeight: 1.35 }}>
              {category.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
