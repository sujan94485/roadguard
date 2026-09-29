import React from 'react';
import { ReportUpdateRecord } from '../../types/database.types';
import { StatusBadge } from '../common/Badge';
import { Clock, UserCheck, MessageSquare } from 'lucide-react';

interface AuditTrailViewProps {
  updates: ReportUpdateRecord[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ updates }) => {
  if (updates.length === 0) {
    return (
      <div
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px',
          color: '#94A3B8',
          fontSize: '0.875rem'
        }}
      >
        <Clock size={24} color="#64748B" style={{ margin: '0 auto 8px auto' }} />
        <div style={{ fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
          Awaiting Initial Triage Review
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          No administrative status transitions or crew dispatch notes have been logged for this incident yet.
        </div>
      </div>
    );
  }

  return (
    <div className="track-audit-container">
      {updates.map((update, index) => {
        const dateStr = new Date(update.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        const isDemo = update.id?.startsWith('demo-') || update.id?.startsWith('upd-00');

        return (
          <div key={update.id || index} className="track-audit-item">
            {/* Glowing Timeline Node */}
            <div className="track-audit-dot" />

            {/* Event Card */}
            <div className="track-audit-card">
              {/* Event Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <StatusBadge status={update.new_status} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: '#F1F5F9' }}>
                    <UserCheck size={14} color="#38BDF8" />
                    <span>{update.admin_name || 'Authority Reviewer'}</span>
                  </div>
                  {update.department && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: '#94A3B8',
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '2px 7px',
                        borderRadius: '4px'
                      }}
                    >
                      {update.department}
                    </span>
                  )}
                  {isDemo && <span className="sample-tag">DEMO AUDIT</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                  <Clock size={12} />
                  <span>{dateStr}</span>
                </div>
              </div>

              {/* Event Note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MessageSquare size={14} color="#94A3B8" style={{ flexShrink: 0, marginTop: '3px' }} />
                <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
                  {update.comment}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
