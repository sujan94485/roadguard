import React from 'react';
import { ReportStatus } from '../../types/database.types';
import { Check, Clock, Eye, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

const STEPS: { status: ReportStatus; label: string; icon: React.ComponentType<any> }[] = [
  { status: 'submitted', label: 'Submitted', icon: Clock },
  { status: 'under_review', label: 'Under Review', icon: Eye },
  { status: 'in_progress', label: 'In Progress', icon: AlertTriangle },
  { status: 'resolved', label: 'Resolved', icon: CheckCircle2 }
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt,
  resolvedAt
}) => {
  if (currentStatus === 'rejected') {
    return (
      <div
        style={{
          backgroundColor: 'rgba(107, 114, 128, 0.15)',
          border: '1px solid #4B5563',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <XCircle size={24} color="#9CA3AF" />
        <div>
          <div style={{ fontWeight: 700, color: '#F3F4F6' }}>Report Closed / Rejected</div>
          <div style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
            This report was reviewed by municipal authorities and determined to be a duplicate or outside jurisdiction.
          </div>
        </div>
      </div>
    );
  }

  const getStepIndex = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'in_progress':
        return 2;
      case 'resolved':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Background Connecting Bar */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            right: '30px',
            height: '4px',
            backgroundColor: '#1E293B',
            zIndex: 1
          }}
        />

        {/* Active Progress Bar */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            width: `${(currentIndex / (STEPS.length - 1)) * (100 - 16)}%`,
            height: '4px',
            backgroundColor: '#10B981',
            zIndex: 2,
            transition: 'width 0.4s ease'
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted ? '#10B981' : isCurrent ? '#2563EB' : '#0F172A',
                  border: isCurrent ? '3px solid #60A5FA' : isCompleted ? '2px solid #10B981' : '2px solid #334155',
                  color: isCompleted || isCurrent ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 0 12px rgba(37, 99, 235, 0.5)' : 'none'
                }}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? '#F8FAFC' : isCompleted ? '#CBD5E1' : '#64748B'
                  }}
                >
                  {step.label}
                </div>
                {isCurrent && (
                  <div style={{ fontSize: '0.6875rem', color: '#38BDF8', fontWeight: 600 }}>
                    Active Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
