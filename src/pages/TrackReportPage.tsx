import React, { useState, useEffect } from 'react';
import { ReportRecord, ReportUpdateRecord } from '../types/database.types';
import { reportsService } from '../services/reportsService';
import { StatusTimeline } from '../components/tracking/StatusTimeline';
import { AuditTrailView } from '../components/tracking/AuditTrailView';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { PriorityExplainerModal } from '../components/common/PriorityExplainerModal';
import '../styles/tracking.css';
import {
  Search,
  MapPin,
  Clock,
  Calculator,
  AlertCircle,
  Camera,
  ExternalLink,
  PlusCircle,
  FileCheck2,
  Sparkles
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

  const executeSearch = async (codeToSearch: string) => {
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
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const initCode = initialReportCode || (!reportsService.isConnectedMode() ? 'RG-2026-0012' : '');
    if (!initCode) return;

    const loadInitial = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        const found = await reportsService.getReportByIdOrCode(initCode.trim());
        if (isCancelled) return;

        if (found) {
          setReport(found);
          const updatesList = await reportsService.getReportUpdates(found.id);
          if (!isCancelled) setUpdates(updatesList);
        } else {
          setReport(null);
          setUpdates([]);
          setNotFound(true);
        }
      } catch {
        if (!isCancelled) setNotFound(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [initialReportCode]);

  return (
    <div className="container track-page-wrapper">
      {/* 1. Page Header */}
      <div className="track-header-section">
        <div>
          <div className="track-badge">
            <span className="track-beacon" />
            <span className="track-badge-prefix">REPORT TRACKING</span>
            <span className="track-badge-sep">/</span>
            <span className="track-badge-sub">ACCOUNTABILITY TERMINAL</span>
          </div>

          <h1 className="track-headline">Track Road Hazard Status</h1>
          <p className="track-subtitle">
            Enter a report code to monitor status transitions and review administrative dispatch notes.
          </p>
        </div>

        <div className="track-status-pill">
          <span className="track-status-pill-dot" />
          <span>TRACKING ENGINE READY</span>
        </div>
      </div>

      {/* 2. Report Lookup Console */}
      <div className="track-lookup-console">
        <div className="lookup-label-row">
          <span>INCIDENT REPORT IDENTIFIER</span>
          <span>PUBLIC CIVIC AUDIT</span>
        </div>

        <form
          className="lookup-form"
          onSubmit={e => {
            e.preventDefault();
            executeSearch(searchInput);
          }}
        >
          <div className="lookup-input-wrap">
            <Search size={18} className="lookup-input-icon" />
            <input
              type="text"
              className="lookup-input"
              placeholder="e.g. RG-2026-0012"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary lookup-submit-btn"
          >
            <span>{loading ? 'Searching...' : 'Search Incident'}</span>
          </button>
        </form>

        {/* Quick Demo Code Pills */}
        <div className="lookup-shortcuts-row">
          <span>Demonstration shortcuts:</span>
          {demoCodes.map(code => (
            <button
              key={code}
              type="button"
              className="shortcut-code-pill"
              onClick={() => {
                setSearchInput(code);
                executeSearch(code);
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Not Found Alert */}
      {notFound && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderLeft: '4px solid #EF4444',
            borderRadius: '10px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#FCA5A5'
          }}
        >
          <AlertCircle size={22} color="#EF4444" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#F8FAFC', fontSize: '0.9375rem', display: 'block', marginBottom: '2px' }}>
              Report Record Not Found
            </strong>
            <span style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>
              No incident record matched code <code>{searchInput}</code>. Please check the code format (e.g.{' '}
              <code>RG-2026-0012</code>) or select one of the demo shortcuts above.
            </span>
          </div>
        </div>
      )}

      {/* 4. Report Record Found: Incident Tracking Workspace */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Accountability Summary Bar */}
          <div className="track-summary-grid">
            <div className="track-summary-cell">
              <span className="track-summary-label">REPORT INGESTED</span>
              <span className="track-summary-val">
                {new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="track-summary-cell">
              <span className="track-summary-label">SPATIAL COORDINATES</span>
              <span className="track-summary-val" style={{ fontFamily: 'monospace' }}>
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </span>
            </div>

            <div className="track-summary-cell">
              <span className="track-summary-label">PRIORITY TIER</span>
              <span className="track-summary-val" style={{ color: '#38BDF8' }}>
                {report.priority_level.toUpperCase()} ({report.priority_score}/100)
              </span>
            </div>

            <div className="track-summary-cell">
              <span className="track-summary-label">DISPATCH STATE</span>
              <span className="track-summary-val" style={{ color: '#F8FAFC' }}>
                {report.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Main Incident Dossier Card */}
          <div className="incident-dossier-card">
            {/* Dossier Header */}
            <div className="dossier-header-row">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  CIVIC ROAD HAZARD RECORD
                </div>
                <h2 className="dossier-code">{report.report_code}</h2>
                <div className="dossier-hazard-type">
                  {report.hazard_type.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <PriorityBadge level={report.priority_level} score={report.priority_score} />
                <StatusBadge status={report.status} />
                {report.id.startsWith('demo-') || report.id.startsWith('rep-00') ? (
                  <span className="sample-tag">Sample Demonstration Data</span>
                ) : (
                  <span className="user-tag">User Submitted</span>
                )}
              </div>
            </div>

            {/* Status Lifecycle Rail */}
            <div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '8px' }}>
                INCIDENT RESOLUTION LIFECYCLE
              </div>
              <StatusTimeline
                currentStatus={report.status}
                createdAt={report.created_at}
                updatedAt={report.updated_at}
                resolvedAt={report.resolved_at}
              />
            </div>

            {/* Spatial & Priority Dossier Grid */}
            <div className="track-details-grid">
              {/* Location Panel */}
              <div className="track-panel-box">
                <div className="track-panel-title">
                  <MapPin size={14} color="#38BDF8" />
                  <span>SPATIAL LOCATION</span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC' }}>
                  {report.location_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                  GPS: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('/map')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    padding: '4px 10px'
                  }}
                >
                  <ExternalLink size={12} />
                  <span>Locate on Safety Map</span>
                </button>
              </div>

              {/* Priority Assessment Panel */}
              <div className="track-panel-box">
                <div className="track-panel-title">
                  <Calculator size={14} color="#38BDF8" />
                  <span>PRIORITY EVALUATION</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC' }}>
                    {report.priority_score}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>/ 100</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginLeft: 'auto' }}>
                    RULE-BASED DETERMINISTIC
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExplaining(true)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    alignSelf: 'flex-start',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    padding: '4px 10px'
                  }}
                >
                  <Sparkles size={12} color="#38BDF8" />
                  <span>View Score Formula Breakdown</span>
                </button>
              </div>
            </div>

            {/* Citizen Context & Evidence */}
            <div className="track-panel-box" style={{ marginTop: '4px' }}>
              <div className="track-panel-title">
                <FileCheck2 size={14} color="#38BDF8" />
                <span>CITIZEN INCIDENT NARRATIVE</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
                {report.description}
              </p>

              {/* Photo Evidence if present */}
              {report.image_url ? (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '6px' }}>
                    PHOTOGRAPHIC EVIDENCE ATTACHED
                  </div>
                  <div className="track-evidence-img-frame" style={{ maxWidth: '440px' }}>
                    <img
                      src={report.image_url}
                      alt={report.hazard_type}
                      className="track-evidence-img"
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: 'rgba(11, 17, 32, 0.6)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.75rem',
                    color: '#64748B',
                    marginTop: '8px'
                  }}
                >
                  <Camera size={14} color="#64748B" />
                  <span>No photo evidence attached with this citizen report.</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Administrative Action Log & Resolution Record */}
          <div className="incident-dossier-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>
                  PUBLIC ACCOUNTABILITY AUDIT
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0 0 0' }}>
                  Administrative Action Log
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                <Clock size={13} color="#38BDF8" />
                <span>{updates.length} {updates.length === 1 ? 'event logged' : 'events logged'}</span>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
              Chronological ledger of status transitions and municipal maintenance crew dispatch actions recorded for this hazard.
            </p>

            <AuditTrailView updates={updates} />
          </div>

          {/* Footer Quick Action */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', paddingTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('/report')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Report Another Road Hazard</span>
            </button>
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
