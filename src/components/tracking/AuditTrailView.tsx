import React from 'react';
import { ReportUpdateRecord } from '../../types/database.types';
import { StatusBadge } from '../common/Badge';
import { Clock } from 'lucide-react';

interface AuditTrailViewProps {
  updates: ReportUpdateRecord[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ updates }) => {
  if (updates.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
        No administrative updates recorded yet. Awaiting initial triage review.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {updates.map((update, index) => {
        const dateStr = new Date(update.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        const isDemo = update.id?.startsWith('demo-') || update.id?.startsWith('upd-00');

        return (
          <div
            key={update.id || index}
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              padding: '16px',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <StatusBadge status={update.new_status} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F5F9' }}>
                  {update.admin_name || 'Authority Reviewer'}
                </span>
                {update.department && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#94A3B8',
                      backgroundColor: '#1E293B',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {update.department}
                  </span>
                )}
                {isDemo && <span className="sample-tag">DEMO UPDATE</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748B' }}>
                <Clock size={12} />
                <span>{dateStr}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              {update.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
};
