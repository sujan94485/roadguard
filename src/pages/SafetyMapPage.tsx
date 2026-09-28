import React, { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { ReportRecord, HazardType, PriorityLevel, ReportStatus } from '../types/database.types';
import { HAZARD_CATEGORIES } from '../types/report.types';
import { SafetyMap } from '../components/map/SafetyMap';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { PriorityExplainerModal } from '../components/common/PriorityExplainerModal';
import {
  Search,
  MapPin,
  X,
  Calculator,
  ArrowRight,
  Info
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
  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHazard = selectedHazard === 'all' || r.hazard_type === selectedHazard;
    const matchesPriority = selectedPriority === 'all' || r.priority_level === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;

    return matchesSearch && matchesHazard && matchesPriority && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
      {/* Top Filter Bar */}
      <div
        style={{
          backgroundColor: '#111827',
          borderBottom: '1px solid #1F2937',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 500
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by code, landmark, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '30px', fontSize: '0.8125rem', height: '32px' }}
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
            Showing <strong>{filteredReports.length}</strong> reported hazard{filteredReports.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={selectedHazard}
            onChange={e => setSelectedHazard(e.target.value as any)}
            style={{ width: 'auto', height: '32px', fontSize: '0.8125rem', padding: '2px 8px' }}
          >
            <option value="all">All Hazard Categories</option>
            {HAZARD_CATEGORIES.map(c => (
              <option key={c.type} value={c.type}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            className="form-control"
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value as any)}
            style={{ width: 'auto', height: '32px', fontSize: '0.8125rem', padding: '2px 8px' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="form-control"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            style={{ width: 'auto', height: '32px', fontSize: '0.8125rem', padding: '2px 8px' }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Map & Detail Drawer Area */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Main Map */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <SafetyMap
            reports={filteredReports}
            selectedReportId={selectedReport?.id}
            onSelectReport={report => setSelectedReport(report)}
            height="100%"
          />
        </div>

        {/* Slide-over Inspection Detail Drawer */}
        {selectedReport && (
          <div
            style={{
              width: '380px',
              maxWidth: '100%',
              backgroundColor: '#111827',
              borderLeft: '1px solid #1F2937',
              height: '100%',
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 600,
              boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#38BDF8', fontWeight: 800 }}>
                    {selectedReport.report_code}
                  </h3>
                  {selectedReport.id.startsWith('demo-') ? (
                    <span className="sample-tag">Sample Demo</span>
                  ) : (
                    <span className="user-tag">User Added</span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>
                  {selectedReport.hazard_type.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <PriorityBadge level={selectedReport.priority_level} score={selectedReport.priority_score} />
              <StatusBadge status={selectedReport.status} />
            </div>

            {/* Photo Evidence if present */}
            {selectedReport.image_url && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #1F2937' }}>
                <img
                  src={selectedReport.image_url}
                  alt={selectedReport.hazard_type}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Location & Hazard Summary */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>
                <MapPin size={14} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{selectedReport.location_name}</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Context Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Severity Assessment:</span>
                <strong style={{ color: '#F1F5F9' }}>{selectedReport.severity.toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Corridor Context:</span>
                <strong style={{ color: '#F1F5F9' }}>{selectedReport.traffic_exposure.toUpperCase()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Surrounding Zone:</span>
                <strong style={{ color: '#F1F5F9' }}>{selectedReport.vulnerability_level.replace('_', ' ').toUpperCase()}</strong>
              </div>
            </div>

            {/* Priority Explainer Button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsExplaining(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Calculator size={14} color="#38BDF8" />
              <span>Explain Priority Score ({selectedReport.priority_score}/100)</span>
            </button>

            {/* Track Status Direct Link */}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate(`/track/${selectedReport.report_code}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span>View Resolution Timeline</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
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
