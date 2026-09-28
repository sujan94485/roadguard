import React from 'react';
import { PriorityBreakdown } from '../../types/database.types';
import { PriorityBadge } from './Badge';
import { X, Info, Calculator, ShieldCheck } from 'lucide-react';

interface PriorityExplainerModalProps {
  breakdown: PriorityBreakdown;
  reportCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityExplainerModal: React.FC<PriorityExplainerModalProps> = ({
  breakdown,
  reportCode,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          padding: '24px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calculator size={18} color="#38BDF8" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Priority Engine Explanation</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
              Transparent mathematical risk evaluation for <strong>{reportCode}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Priority Summary Banner */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '4px' }}>Calculated Priority Rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PriorityBadge level={breakdown.priority_level} score={breakdown.total_score} />
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC' }}>
                {breakdown.total_score} / 100 Points
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Formula Verified</span>
            <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Rule-Based Model
            </span>
          </div>
        </div>

        {/* Formula Display */}
        <div
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#0B0F19',
            border: '1px solid #1E293B',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '20px',
            color: '#CBD5E1',
            fontFamily: 'monospace'
          }}
        >
          P_total = Severity (35) + Traffic (25) + Vulnerability (20) + Cluster (10) + Aging (10)
        </div>

        {/* Factors Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {breakdown.factors.map((factor, idx) => {
            const percentage = Math.round((factor.score / factor.maxScore) * 100);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '8px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#F1F5F9' }}>{factor.factor}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: factor.score > 0 ? '#38BDF8' : '#64748B' }}>
                    {factor.score} / {factor.maxScore} pts
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '6px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      backgroundColor: factor.score >= factor.maxScore * 0.75 ? '#EF4444' : factor.score >= factor.maxScore * 0.5 ? '#F59E0B' : '#38BDF8',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1', marginBottom: '2px' }}>
                  {factor.detail}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Rationale: {factor.rationale}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explainability Footer Disclaimer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94A3B8', borderTop: '1px solid #1F2937', paddingTop: '14px' }}>
          <Info size={14} color="#60A5FA" />
          <span>
            Scoring is deterministic and transparent. No black-box machine learning is used to determine dispatch priority.
          </span>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
