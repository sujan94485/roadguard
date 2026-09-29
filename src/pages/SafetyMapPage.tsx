import React, { useState, useMemo } from 'react';
import { useReports } from '../hooks/useReports';
import { ReportRecord, HazardType, PriorityLevel, ReportStatus } from '../types/database.types';
import { HAZARD_CATEGORIES } from '../types/report.types';
import { SafetyMap } from '../components/map/SafetyMap';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { PriorityExplainerModal } from '../components/common/PriorityExplainerModal';
import '../styles/map.css';
import {
  Search,
  MapPin,
  X,
  Calculator,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  RotateCcw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface SafetyMapPageProps {
  onNavigate: (route: string) => void;
}

export const SafetyMapPage: React.FC<SafetyMapPageProps> = ({ onNavigate }) => {
  const { reports } = useReports();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHazard, setSelectedHazard] = useState<HazardType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');

  // Selected Detail State
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesHazard = selectedHazard === 'all' || r.hazard_type === selectedHazard;
      const matchesPriority = selectedPriority === 'all' || r.priority_level === selectedPriority;
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

      return matchesSearch && matchesHazard && matchesPriority && matchesStatus;
    });
  }, [reports, searchQuery, selectedHazard, selectedPriority, selectedStatus]);

  // Derived telemetry metrics strictly from actual report data
  const telemetry = useMemo(() => {
    const highRisk = filteredReports.filter(
      r => r.priority_level === 'critical' || r.priority_level === 'high'
    ).length;
    const inTriage = filteredReports.filter(
      r => r.status === 'submitted' || r.status === 'under_review' || r.status === 'in_progress'
    ).length;
    const resolved = filteredReports.filter(r => r.status === 'resolved').length;

    return {
      visible: filteredReports.length,
      total: reports.length,
      highRisk,
      inTriage,
      resolved
    };
  }, [filteredReports, reports.length]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedHazard !== 'all' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedHazard('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
  };

  return (
    <div className="container spatial-page-wrapper">
      {/* 1. Spatial Operations Page Header */}
      <div className="spatial-header-section">
        <div className="spatial-header-badge">
          <span className="spatial-beacon" />
          <span className="spatial-badge-prefix">SPATIAL INTELLIGENCE</span>
          <span className="spatial-badge-sep">/</span>
          <span className="spatial-badge-sub">ROAD HAZARD OPERATIONS</span>
        </div>

        <div className="spatial-title-row">
          <div>
            <h1 className="spatial-headline">Safety Map</h1>
          </div>

          <div className="spatial-status-strip">
            <div className="spatial-status-item success">
              <span className="spatial-status-dot" />
              <span>SPATIAL ENGINE ONLINE</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <div className="spatial-status-item active">
              <span>RULE-BASED TRIAGE ACTIVE</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <div className="spatial-status-item">
              <span>{reports.length} HAZARD COORDINATES</span>
            </div>
          </div>
        </div>

        <p className="spatial-subtitle">
          Real-time spatial visualization of citizen-reported roadway hazards and deterministic rule-based priority scores across municipal transit corridors.
        </p>
      </div>

      {/* 2. Intelligence Telemetry Strip (HUD Counters) */}
      <div className="spatial-telemetry-grid">
        <div className="telemetry-card card-cyan">
          <div className="telemetry-card-content">
            <span className="telemetry-card-label">ACTIVE INCIDENTS</span>
            <span className="telemetry-card-value">{telemetry.visible}</span>
            <span className="telemetry-card-sub">
              {telemetry.visible === 1 ? '1 hazard displayed' : `${telemetry.visible} hazards displayed`}
            </span>
          </div>
          <div className="telemetry-card-icon" style={{ color: '#38BDF8' }}>
            <Activity size={18} />
          </div>
        </div>

        <div className="telemetry-card card-red">
          <div className="telemetry-card-content">
            <span className="telemetry-card-label">HIGH PRIORITY INCIDENTS</span>
            <span className="telemetry-card-value" style={{ color: '#FCA5A5' }}>
              {telemetry.highRisk}
            </span>
            <span className="telemetry-card-sub">Critical / High priority</span>
          </div>
          <div className="telemetry-card-icon" style={{ color: '#EF4444' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="telemetry-card card-amber">
          <div className="telemetry-card-content">
            <span className="telemetry-card-label">IN MUNICIPAL TRIAGE</span>
            <span className="telemetry-card-value" style={{ color: '#FCD34D' }}>
              {telemetry.inTriage}
            </span>
            <span className="telemetry-card-sub">Submitted / Under review / Active</span>
          </div>
          <div className="telemetry-card-icon" style={{ color: '#F59E0B' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="telemetry-card card-green">
          <div className="telemetry-card-content">
            <span className="telemetry-card-label">RESOLVED HAZARDS</span>
            <span className="telemetry-card-value" style={{ color: '#86EFAC' }}>
              {telemetry.resolved}
            </span>
            <span className="telemetry-card-sub">Repairs verified complete</span>
          </div>
          <div className="telemetry-card-icon" style={{ color: '#10B981' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* 3. Integrated Spatial Query Console */}
      <div className="spatial-query-console">
        <div className="console-header-bar">
          <div className="console-header-left">
            <SlidersHorizontal size={14} />
            <span>SPATIAL QUERY CONSOLE</span>
          </div>
          <div className="console-header-right">
            <span>
              Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> incidents
            </span>
          </div>
        </div>

        <div className="console-controls-grid">
          {/* Search Input */}
          <div className="console-field-group console-field-search">
            <label className="console-field-label">SEARCH INCIDENTS</label>
            <div className="console-input-wrap">
              <Search size={14} className="console-input-icon" />
              <input
                type="text"
                className="console-input"
                placeholder="Search by code, landmark, description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="console-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Hazard Category Filter */}
          <div className="console-field-group">
            <label className="console-field-label">CATEGORY</label>
            <select
              className="console-select"
              value={selectedHazard}
              onChange={e => setSelectedHazard(e.target.value as any)}
            >
              <option value="all">All Hazard Categories</option>
              {HAZARD_CATEGORIES.map(c => (
                <option key={c.type} value={c.type}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level Filter */}
          <div className="console-field-group">
            <label className="console-field-label">PRIORITY</label>
            <select
              className="console-select"
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as any)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (85–100)</option>
              <option value="high">High (65–84)</option>
              <option value="medium">Medium (40–64)</option>
              <option value="low">Low (0–39)</option>
            </select>
          </div>

          {/* Report Status Filter */}
          <div className="console-field-group">
            <label className="console-field-label">STATUS</label>
            <select
              className="console-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="console-field-group console-field-action">
            {hasActiveFilters ? (
              <button
                type="button"
                className="console-reset-btn"
                onClick={handleResetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </button>
            ) : (
              <div style={{ height: '38px' }} />
            )}
          </div>
        </div>
      </div>

      {/* 4. Large Spatial Incident Map Operations Container */}
      <div className="spatial-map-console">
        {/* Map Command Bar Shell */}
        <div className="spatial-map-topbar">
          <div className="map-topbar-left">
            <Compass size={16} color="#38BDF8" />
            <span className="map-shell-title">SPATIAL INCIDENT TELEMETRY</span>
            <span className="map-shell-tag">ROADGUARD OPERATIONS GRID</span>
          </div>

          <div className="map-topbar-right">
            <div className="map-telemetry-badge">
              <span className="map-telemetry-beacon" />
              <span>OSM GRID • MYSURU DEMONSTRATION</span>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>DEMO TELEMETRY</span>
          </div>
        </div>

        {/* Map Inner Stage */}
        <div style={{ position: 'relative', width: '100%' }}>
          <SafetyMap
            reports={filteredReports}
            selectedReportId={selectedReport?.id}
            onSelectReport={report => setSelectedReport(report)}
            height="620px"
          />

          {/* Empty Search Overlay if No Hazards Match */}
          {filteredReports.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 450,
                background: 'rgba(11, 17, 32, 0.94)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '12px',
                padding: '24px 32px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
              }}
            >
              <AlertTriangle size={32} color="#F59E0B" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                No Hazards Found
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 16px 0', maxWidth: '280px' }}>
                No reported incidents match the current search query or filter parameters.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
              >
                <RotateCcw size={13} />
                <span>Reset Query Filters</span>
              </button>
            </div>
          )}

          {/* Slide-over Inspection Detail Drawer */}
          {selectedReport && (
            <div className="incident-drawer">
              {/* Drawer Header */}
              <div className="drawer-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#38BDF8', fontWeight: 800, margin: 0 }}>
                      {selectedReport.report_code}
                    </h3>
                    {selectedReport.id.startsWith('demo-') || selectedReport.id.startsWith('rep-00') ? (
                      <span className="sample-tag">Sample Demo</span>
                    ) : (
                      <span className="user-tag">User Added</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F1F5F9', letterSpacing: '0.02em' }}>
                    {selectedReport.hazard_type.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={() => setSelectedReport(null)}
                  title="Close inspection panel"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="drawer-body">
                {/* Priority & Status Badges */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <PriorityBadge level={selectedReport.priority_level} score={selectedReport.priority_score} />
                  <StatusBadge status={selectedReport.status} />
                </div>

                {/* Photo Evidence if Present */}
                {selectedReport.image_url && (
                  <div className="drawer-image-frame">
                    <span className="drawer-image-tag">EVIDENCE CAPTURE</span>
                    <img
                      src={selectedReport.image_url}
                      alt={selectedReport.hazard_type}
                      className="drawer-image"
                    />
                  </div>
                )}

                {/* Spatial Position & Narrative */}
                <div className="drawer-section-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>
                    <MapPin size={15} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{selectedReport.location_name}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748B', fontFamily: 'monospace', marginBottom: '8px' }}>
                    LAT {selectedReport.latitude.toFixed(4)} • LNG {selectedReport.longitude.toFixed(4)}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
                    {selectedReport.description}
                  </p>
                </div>

                {/* Corridor & Severity Assessment Metrics */}
                <div className="drawer-metric-grid">
                  <div className="drawer-metric-item">
                    <span className="drawer-metric-label">SEVERITY</span>
                    <span className="drawer-metric-value">{selectedReport.severity.toUpperCase()}</span>
                  </div>
                  <div className="drawer-metric-item">
                    <span className="drawer-metric-label">ROADWAY TYPE</span>
                    <span className="drawer-metric-value">{selectedReport.traffic_exposure.toUpperCase()}</span>
                  </div>
                  <div className="drawer-metric-item" style={{ gridColumn: 'span 2' }}>
                    <span className="drawer-metric-label">SURROUNDING VULNERABILITY</span>
                    <span className="drawer-metric-value">
                      {selectedReport.vulnerability_level.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="drawer-actions">
                  {/* Priority Explainer Button */}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsExplaining(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px'
                    }}
                  >
                    <Calculator size={15} color="#38BDF8" />
                    <span>Explain Priority Score ({selectedReport.priority_score}/100)</span>
                  </button>

                  {/* Track Status Direct Link */}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onNavigate(`/track/${selectedReport.report_code}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 14px'
                    }}
                  >
                    <span>View Resolution Timeline</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explainer Modal */}
      {selectedReport && isExplaining && (
        <PriorityExplainerModal
          breakdown={selectedReport.priority_breakdown}
          reportCode={selectedReport.report_code}
          isOpen={isExplaining}
          onClose={() => setIsExplaining(false)}
        />
      )}
    </div>
  );
};
