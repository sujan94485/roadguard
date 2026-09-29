import React from 'react';
import { ReportForm } from '../components/reports/ReportForm';
import '../styles/report.css';
import { AlertTriangle, Radio } from 'lucide-react';

interface ReportHazardPageProps {
  onNavigate: (route: string) => void;
}

export const ReportHazardPage: React.FC<ReportHazardPageProps> = ({ onNavigate }) => {
  return (
    <div className="container-narrow" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
      {/* 1. Header */}
      <div style={{ marginBottom: '24px' }}>
        {/* Civic Badge Pill */}
        <div className="intake-header-badge">
          <span className="live-beacon" />
          <span style={{ fontSize: '0.71875rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#CBD5E1' }}>
            CITIZEN REPORTING TERMINAL
          </span>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            MUNICIPAL INTAKE
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="intake-title">
          Report a Road Safety Hazard
        </h1>

        {/* Supporting Text with Status Telemetry */}
        <p className="intake-subtitle">
          Submit verified details, location coordinates, and photographic proof of road defects. All reports are processed through an explainable, rule-based priority engine for municipal public works triage.
        </p>

        {/* Live Intake Status Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
          <Radio size={13} color="#34D399" />
          <span>Active Session • Ready for Automated Rule-Based Triage</span>
        </div>
      </div>

      {/* 2. Emergency Advisory Banner */}
      <div className="intake-advisory-banner">
        <AlertTriangle size={17} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#F8FAFC' }}>Emergency Advisory: </strong>
          <span>
            For active collisions, downed live electrical wires, or immediate life-threatening road hazards, contact emergency services (112) immediately before logging an infrastructure work order.
          </span>
        </div>
      </div>

      {/* 3. Guided Report Form */}
      <ReportForm
        onSuccess={reportCode => {
          onNavigate(`/track/${reportCode}`);
        }}
      />
    </div>
  );
};
