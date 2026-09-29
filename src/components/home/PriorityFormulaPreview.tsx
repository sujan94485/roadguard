import React, { useState } from 'react';
import { calculateHazardPriority } from '../../services/priorityEngine';
import { SeverityLevel, TrafficExposureLevel, VulnerabilityZone } from '../../types/database.types';
import { Calculator, ShieldCheck, ChevronRight } from 'lucide-react';

const DEMO_EVALUATION_DATE = '2026-09-25T08:00:00Z'; // 4 days pending demonstration

export const PriorityFormulaPreview: React.FC = () => {
  const [severity, setSeverity] = useState<SeverityLevel>('severe');
  const [traffic, setTraffic] = useState<TrafficExposureLevel>('high');
  const [vulnerability, setVulnerability] = useState<VulnerabilityZone>('school_zone');
  const [clusterCount, setClusterCount] = useState<number>(2);

  const evaluation = calculateHazardPriority({
    hazard_type: 'pothole',
    severity,
    traffic_exposure: traffic,
    vulnerability_level: vulnerability,
    existing_cluster_count: clusterCount,
    created_at: DEMO_EVALUATION_DATE
  });

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const priorityColor = getPriorityColor(evaluation.level);

  return (
    <div className="formula-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '7px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8',
              flexShrink: 0
            }}
          >
            <Calculator size={15} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Deterministic Priority Scoring Engine (0–100)
            </h3>
            <div style={{ fontSize: '0.71875rem', color: '#94A3B8' }}>
              Formula: Severity (35%) + Traffic Exposure (25%) + Vulnerability Zone (20%) + Clustering (10%) + Aging (10%)
            </div>
          </div>
        </div>

        {/* Live Calculated Output Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(11, 15, 25, 0.92)',
            border: `1px solid ${priorityColor}`,
            padding: '5px 12px',
            borderRadius: '7px',
            boxShadow: `0 0 14px ${priorityColor}22`,
            flexShrink: 0
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 600 }}>SCORE</div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: priorityColor,
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1
              }}
            >
              {evaluation.score} / 100
            </div>
          </div>
          <div
            style={{
              padding: '3px 7px',
              borderRadius: '5px',
              backgroundColor: `${priorityColor}20`,
              color: priorityColor,
              fontWeight: 800,
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {evaluation.level}
          </div>
        </div>
      </div>

      {/* Interactive Controls to Test Deterministic Logic */}
      <div className="formula-controls-grid">
        {/* Control 1: Severity */}
        <div>
          <label style={{ display: 'block', fontSize: '0.71875rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '5px' }}>
            1. Defect Severity (Max 35)
          </label>
          <select
            className="form-control"
            value={severity}
            onChange={e => setSeverity(e.target.value as SeverityLevel)}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="minor">Minor (10 pts)</option>
            <option value="moderate">Moderate (20 pts)</option>
            <option value="severe">Severe (30 pts)</option>
            <option value="catastrophic">Catastrophic (35 pts)</option>
          </select>
        </div>

        {/* Control 2: Traffic Exposure */}
        <div>
          <label style={{ display: 'block', fontSize: '0.71875rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '5px' }}>
            2. Traffic Exposure (Max 25)
          </label>
          <select
            className="form-control"
            value={traffic}
            onChange={e => setTraffic(e.target.value as TrafficExposureLevel)}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="low">Low - Residential (5 pts)</option>
            <option value="medium">Medium - Collector (15 pts)</option>
            <option value="high">High - Transit Corridor (20 pts)</option>
            <option value="arterial">Arterial Highway (25 pts)</option>
          </select>
        </div>

        {/* Control 3: Vulnerability */}
        <div>
          <label style={{ display: 'block', fontSize: '0.71875rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '5px' }}>
            3. Vulnerability Zone (Max 20)
          </label>
          <select
            className="form-control"
            value={vulnerability}
            onChange={e => setVulnerability(e.target.value as VulnerabilityZone)}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value="standard">Standard Corridor (5 pts)</option>
            <option value="transit_hub">Transit Station (12 pts)</option>
            <option value="hospital_zone">Hospital Corridor (16 pts)</option>
            <option value="school_zone">School Zone (20 pts)</option>
          </select>
        </div>

        {/* Control 4: Clustering */}
        <div>
          <label style={{ display: 'block', fontSize: '0.71875rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '5px' }}>
            4. Corroborating Reports (Max 10)
          </label>
          <select
            className="form-control"
            value={clusterCount}
            onChange={e => setClusterCount(Number(e.target.value))}
            style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
          >
            <option value={0}>0 Reports - Standalone (0 pts)</option>
            <option value={2}>2 Reports - Corroborated (5 pts)</option>
            <option value={4}>4+ Reports - Dense Hotspot (10 pts)</option>
          </select>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="formula-factor-bar">
        {evaluation.factors.map((factor, index) => {
          const pct = Math.round((factor.score / factor.maxScore) * 100);
          return (
            <div key={index} className="formula-factor-chip">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 600 }}>
                  {factor.factor}
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#38BDF8',
                    flexShrink: 0
                  }}
                >
                  +{factor.score}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: '#38BDF8',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span className="formula-factor-chip-detail">
                {factor.detail}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit Footnote */}
      <div
        style={{
          marginTop: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.71875rem',
          color: '#64748B'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="#10B981" />
          <span>Zero Black-Box Guesswork • Every priority score includes human-readable rationales for municipal engineers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38BDF8' }}>
          <span>Deterministic Triage Standard</span>
          <ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
};
