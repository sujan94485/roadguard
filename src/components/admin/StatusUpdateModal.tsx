import React, { useState } from 'react';
import { ReportRecord, ReportStatus } from '../../types/database.types';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import { X, Shield, Send } from 'lucide-react';

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
          maxWidth: '540px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          padding: '24px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#F59E0B" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Update Hazard Status</h3>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Administrative status transition for <strong>{report.report_code}</strong>
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

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #DC2626',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.8125rem',
              marginBottom: '16px'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">New Status</label>
            <select
              className="form-control"
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as ReportStatus)}
            >
              <option value="submitted">Submitted (Intake)</option>
              <option value="under_review">Under Review (Inspection Assigned)</option>
              <option value="in_progress">In Progress (Maintenance Crew Dispatched)</option>
              <option value="resolved">Resolved (Hazard Fixed & Verified)</option>
              <option value="rejected">Closed / Duplicate</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Administrative Action / Dispatch Note</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Patching team deployed with cold-mix asphalt; repair scheduled within 24 hours..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
              Logged by: <strong>{user?.full_name}</strong> ({user?.department || 'Municipal Road Maintenance Team'})
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Recording Action...' : 'Record Status Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
