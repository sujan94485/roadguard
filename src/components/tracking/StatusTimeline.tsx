import React from 'react';
import { ReportStatus } from '../../types/database.types';
import { Check, Clock, Eye, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ReportStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

const STEPS: { status: ReportStatus; stepNum: string; label: string; icon: React.ComponentType<any> }[] = [
  { status: 'submitted', stepNum: '01', label: 'Submitted', icon: Clock },
  { status: 'under_review', stepNum: '02', label: 'Under Review', icon: Eye },
  { status: 'in_progress', stepNum: '03', label: 'In Progress', icon: AlertTriangle },
  { status: 'resolved', stepNum: '04', label: 'Resolved', icon: CheckCircle2 }
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
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderLeft: '4px solid #9CA3AF',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <XCircle size={28} color="#9CA3AF" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: '#F3F4F6', fontSize: '0.9375rem' }}>
            Report Closed / Duplicate Record
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', lineHeight: 1.45, marginTop: '2px' }}>
            This incident report was reviewed by municipal triage authorities and determined to be an existing duplicate or outside roadway maintenance jurisdiction.
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

  const formatTimestamp = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  const getStageTime = (idx: number) => {
    if (idx === 0) return formatTimestamp(createdAt);
    if (idx === 3 && currentStatus === 'resolved') return formatTimestamp(resolvedAt || updatedAt);
    if (idx === currentIndex) return formatTimestamp(updatedAt);
    return null;
  };

  return (
    <div className="track-timeline-container">
      <div className="track-timeline-track">
        {/* Background Connecting Rail */}
        <div className="track-timeline-line-bg" />

        {/* Dynamic Progress Fill Line */}
        <div
          className="track-timeline-line-fill"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * (100 - 18)}%`
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;
          const stageTime = getStageTime(idx);

          return (
            <div key={step.status} className="track-stage-node">
              <div
                className={`track-stage-bubble ${
                  isCompleted ? 'completed' : isCurrent ? 'current' : 'future'
                }`}
              >
                {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={19} />}
              </div>

              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: isCurrent ? '#38BDF8' : isCompleted ? '#10B981' : '#64748B',
                    textTransform: 'uppercase'
                  }}
                >
                  {step.stepNum}
                </span>

                <span
                  className={`track-stage-label ${
                    isCompleted ? 'completed' : isCurrent ? 'current' : 'future'
                  }`}
                >
                  {step.label}
                </span>

                {isCurrent && (
                  <span className="track-stage-active-pill">
                    ACTIVE STAGE
                  </span>
                )}

                {stageTime && (
                  <span className="track-stage-time">
                    {stageTime}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
