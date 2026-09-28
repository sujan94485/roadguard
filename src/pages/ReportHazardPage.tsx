import React from 'react';
import { ReportForm } from '../components/reports/ReportForm';
import { ShieldCheck, Info } from 'lucide-react';

interface ReportHazardPageProps {
  onNavigate: (route: string) => void;
}

export const ReportHazardPage: React.FC<ReportHazardPageProps> = ({ onNavigate }) => {
  return (
    <div className="container-narrow" style={{ padding: '36px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={20} color="#38BDF8" />
          <span style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
            Citizen Reporting
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>Report a Road Safety Hazard</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.5 }}>
          Submit details and photos of road surface defects, dark corridors, or damaged traffic infrastructure.
          Reports are prioritized using an objective, rule-based formula designed for municipal workflows.
        </p>
      </div>

      {/* Emergency Advisory Banner */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px',
          fontSize: '0.8125rem',
          color: '#CBD5E1'
        }}
      >
        <Info size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Emergency Note:</strong> For immediate danger, active collisions, or live electrical hazards, contact local emergency services before submitting an infrastructure report.
        </span>
      </div>

      {/* Form */}
      <ReportForm
        onSuccess={reportCode => {
          onNavigate(`/track/${reportCode}`);
        }}
      />
    </div>
  );
};
