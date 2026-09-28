import React from 'react';
import { useReports } from '../../hooks/useReports';
import { ShieldCheck, RefreshCw, HeartHandshake, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetDemoData } = useReports();

  return (
    <footer
      style={{
        borderTop: '1px solid #1F2937',
        backgroundColor: '#0B0F19',
        padding: '36px 0 24px 0',
        marginTop: '60px'
      }}
    >
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '28px' }}>
          <div style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldCheck size={20} color="#38BDF8" />
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC' }}>RoadGuard</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Civic Road Safety</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.6 }}>
              A civic-tech initiative bridging the gap between citizen hazard reporting, transparent risk prioritization, and accountable public works resolution.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '10px' }}>
              Drive Safe Hackathon
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '12px' }}>
              Built for live technical demonstration. Uses rule-based priority scoring without black-box claims.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={resetDemoData}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                title="Reset local reports and updates back to initial demo state"
              >
                <RefreshCw size={12} />
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.75rem',
            color: '#64748B'
          }}
        >
          <div>
            © 2026 RoadGuard Civic Platform. Built for Drive Safe Hackathon.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> Map data © OpenStreetMap contributors
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HeartHandshake size={12} /> Designed for municipal workflows
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
