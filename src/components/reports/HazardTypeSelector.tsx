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
  HelpCircle,
  Check
} from 'lucide-react';

export interface HazardTypeSelectorProps {
  selectedType: HazardType;
  onSelect: (type: HazardType) => void;
}

export const HazardTypeSelector: React.FC<HazardTypeSelectorProps> = ({ selectedType, onSelect }) => {
  const getIcon = (type: HazardType) => {
    switch (type) {
      case 'pothole':
        return <AlertCircle size={18} />;
      case 'broken_traffic_signal':
        return <TrafficCone size={18} />;
      case 'poor_street_lighting':
        return <LightbulbOff size={18} />;
      case 'unsafe_pedestrian_crossing':
        return <Footprints size={18} />;
      case 'road_damage':
        return <Wrench size={18} />;
      case 'waterlogging':
        return <Waves size={18} />;
      case 'obstruction':
        return <ShieldAlert size={18} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  return (
    <div className="hazard-grid" role="radiogroup" aria-label="Hazard Type Classification">
      {HAZARD_CATEGORIES.map(category => {
        const isSelected = selectedType === category.type;
        return (
          <div
            key={category.type}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => onSelect(category.type)}
            onKeyDown={e => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                onSelect(category.type);
              }
            }}
            className={`hazard-item-card ${isSelected ? 'selected' : ''}`}
          >
            {/* Top Row: Icon + Title + Selected Check */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  className="hazard-icon-bubble"
                  style={{
                    color: isSelected ? '#38BDF8' : category.color
                  }}
                >
                  {getIcon(category.type)}
                </div>
                <span className="hazard-card-name">
                  {category.label}
                </span>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#38BDF8',
                    color: '#070A12',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Description */}
            <p className="hazard-card-desc">
              {category.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
