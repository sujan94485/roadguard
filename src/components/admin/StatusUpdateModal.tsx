import React, { useState } from 'react';
import { ReportRecord, ReportStatus } from '../../types/database.types';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import { X, Shield, Send, AlertCircle, Loader2 } from 'lucide-react';

interface StatusUpdateModalProps {
  report: ReportRecord;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  report,
  isOpen,
  onClose,
  onUpdated
}) => {
  const { updateStatus } = useReports();
  const { user } = useAuth();

  const [newStatus, setNewStatus] = useState<ReportStatus>(
    report.status === 'submitted' ? 'under_review' : report.status === 'under_review' ? 'in_progress' : 'resolved'
  );
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMessage('Please provide an administrative triage or dispatch note.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await updateStatus(report.id, newStatus, comment.trim());
      onUpdated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update report status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-box" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={18} color="#38BDF8" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                Status Transition Console
              </h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
              Recording operational triage update for Incident <strong style={{ color: '#38BDF8' }}>{report.report_code}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.8125rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#CBD5E1' }}>
              TARGET OPERATIONAL STATUS
            </label>
            <select
              className="form-control"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ReportStatus)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#F8FAFC',
                height: '40px',
                fontSize: '0.875rem'
              }}
            >
              <option value="submitted">Submitted (Intake Received)</option>
              <option value="under_review">Under Review (Inspection Assigned)</option>
              <option value="in_progress">In Progress (Maintenance Crew Dispatched)</option>
              <option value="resolved">Resolved (Repairs Fixed & Verified)</option>
              <option value="rejected">Closed / Duplicate</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#CBD5E1' }}>
              ADMINISTRATIVE DISPATCH & AUDIT NOTE
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Patching team deployed with cold-mix asphalt; repair scheduled within 24 hours..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                lineHeight: 1.5
              }}
            />
            <div
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              Audit Attribution: <strong style={{ color: '#F8FAFC' }}>{user?.full_name || 'Authenticated Operator'}</strong> ({user?.department || 'Municipal Road Maintenance Team'})
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Recording Action...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Record Status Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
