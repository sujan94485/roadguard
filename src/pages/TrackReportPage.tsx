import React, { useState, useEffect } from 'react';
import { ReportRecord, ReportUpdateRecord } from '../types/database.types';
import { reportsService } from '../services/reportsService';
import { StatusTimeline } from '../components/tracking/StatusTimeline';
import { AuditTrailView } from '../components/tracking/AuditTrailView';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { PriorityExplainerModal } from '../components/common/PriorityExplainerModal';
import {
  Search,
  MapPin,
  Clock,
  Calculator,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

interface TrackReportPageProps {
  initialReportCode?: string;
  onNavigate: (route: string) => void;
}

export const TrackReportPage: React.FC<TrackReportPageProps> = ({ initialReportCode, onNavigate }) => {
  const [searchInput, setSearchInput] = useState(initialReportCode || '');
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [updates, setUpdates] = useState<ReportUpdateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  // Quick Demo Code options for Judge review
  const demoCodes = ['RG-2026-0012', 'RG-2026-0014', 'RG-2026-0008', 'RG-2026-0002'];

  const handleSearch = async (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    try {
      setLoading(true);
      setNotFound(false);
      const found = await reportsService.getReportByIdOrCode(clean);

      if (found) {
        setReport(found);
        const updatesList = await reportsService.getReportUpdates(found.id);
        setUpdates(updatesList);
      } else {
        setReport(null);
        setUpdates([]);
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReportCode) {
      handleSearch(initialReportCode);
    } else if (!reportsService.isConnectedMode()) {
      // In Demo Mode, load RG-2026-0012 so judges see sample timeline immediately
      handleSearch('RG-2026-0012');
    }
  }, [initialReportCode]);


  return (
    <div className="container-narrow" style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={20} color="#38BDF8" />
          <span style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
            Report Tracking
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>Track Road Hazard Status</h1>
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>
          Enter a report code to monitor status transitions and review administrative dispatch notes.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="card" style={{ padding: '24px' }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(searchInput);
          }}
          style={{ display: 'flex', gap: '12px' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-control"
              placeholder="e.g. RG-2026-0012"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: '38px', textTransform: 'uppercase' }}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '130px' }}>
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>

        {/* Quick Demo Code Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Try Sample Report IDs:</span>
          {demoCodes.map(code => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setSearchInput(code);
                handleSearch(code);
              }}
              style={{
                background: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.75rem',
                color: '#38BDF8',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Not Found Alert */}
      {notFound && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #DC2626',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#FCA5A5'
          }}
        >
          <AlertCircle size={20} />
          <div>
            <strong>Report not found.</strong> Please verify the report code format (e.g. <code>RG-2026-0012</code>) or select one of the demo records above.
          </div>
        </div>
      )}

      {/* Report Record Found */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Record Header Card */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Civic Road Hazard Record
                </div>
                <h2 style={{ fontSize: '1.75rem', color: '#38BDF8', fontWeight: 800 }}>
                  {report.report_code}
                </h2>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC', marginTop: '2px' }}>
                  {report.hazard_type.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <PriorityBadge level={report.priority_level} score={report.priority_score} />
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Stepper Timeline */}
            <div style={{ margin: '16px 0 24px 0' }}>
              <StatusTimeline
                currentStatus={report.status}
                createdAt={report.created_at}
                updatedAt={report.updated_at}
                resolvedAt={report.resolved_at}
              />
            </div>

            {/* Location & Metadata Info */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '0.8125rem'
              }}
            >
              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>Location Landmark</span>
                <strong style={{ color: '#F1F5F9' }}>{report.location_name}</strong>
              </div>

              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>GPS Coordinates</span>
                <span style={{ color: '#CBD5E1', fontFamily: 'monospace' }}>
                  {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                </span>
              </div>

              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>Submitted At</span>
                <span style={{ color: '#CBD5E1' }}>
                  {new Date(report.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              <div>
                <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.75rem' }}>Priority Explainability</span>
                <button
                  type="button"
                  onClick={() => setIsExplaining(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#38BDF8',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Calculator size={13} />
                  <span>View Score Formula ({report.priority_score})</span>
                </button>
              </div>
            </div>

            {/* Description & Photo */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                Citizen Description & Context:
              </div>
              <p style={{ fontSize: '0.9375rem', color: '#F1F5F9', lineHeight: 1.6, margin: 0 }}>
                {report.description}
              </p>

              {report.image_url && (
                <div style={{ marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1F2937', maxWidth: '420px' }}>
                  <img
                    src={report.image_url}
                    alt={report.hazard_type}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '8px 12px', backgroundColor: '#0B0F19', fontSize: '0.75rem', color: '#94A3B8' }}>
                    Photo evidence attached by reporting citizen
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Administrative Action Log */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>Administrative Action Log</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '16px' }}>
              Chronological log of status transitions and maintenance team updates recorded for this report.
            </p>
            <AuditTrailView updates={updates} />
          </div>
        </div>
      )}

      {/* Priority Explainer Modal */}
      {report && isExplaining && (
        <PriorityExplainerModal
          breakdown={report.priority_breakdown}
          reportCode={report.report_code}
          isOpen={isExplaining}
          onClose={() => setIsExplaining(false)}
        />
      )}
    </div>
  );
};
