import React, { useState } from 'react';
import { ReportRecord } from '../../types/database.types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { PriorityExplainerModal } from '../common/PriorityExplainerModal';
import { StatusUpdateModal } from './StatusUpdateModal';
import { Calculator, Edit3, Eye, Search, Filter, RotateCcw, MapPin } from 'lucide-react';

interface ReportManagementTableProps {
  reports: ReportRecord[];
  onSelectReport: (report: ReportRecord) => void;
  onRefresh: () => void;
}

export const ReportManagementTable: React.FC<ReportManagementTableProps> = ({
  reports,
  onSelectReport,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal States
  const [explainingReport, setExplainingReport] = useState<ReportRecord | null>(null);
  const [updatingReport, setUpdatingReport] = useState<ReportRecord | null>(null);

  // Filter Reports
  const filteredReports = reports.filter(r => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      r.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hazard_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority_level === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* 1. Incident Query Console */}
      <div className="triage-query-console">
        <div className="triage-search-wrap">
          <Search size={15} className="triage-search-icon" />
          <input
            type="text"
            className="triage-search-input"
            placeholder="Search by Report ID, street, or hazard type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="triage-filter-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="#94A3B8" />
            <select
              className="triage-filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <select
            className="triage-filter-select"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical (85–100)</option>
            <option value="high">High (65–84)</option>
            <option value="medium">Medium (40–64)</option>
            <option value="low">Low (0–39)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 12px' }}
              title="Reset query filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Responsive Incident Triage Container */}
      <div className="triage-table-card">
        {/* A. Desktop Table (Screens >= 900px) */}
        <table className="triage-desktop-table">
          <thead>
            <tr>
              <th className="triage-th" style={{ width: '13%' }}>Report ID</th>
              <th className="triage-th" style={{ width: '13%' }}>Hazard</th>
              <th className="triage-th" style={{ width: '22%' }}>Location</th>
              <th className="triage-th" style={{ width: '15%' }}>Priority & Score</th>
              <th className="triage-th" style={{ width: '20%' }}>Main Reasons for Priority</th>
              <th className="triage-th" style={{ width: '10%' }}>Status</th>
              <th className="triage-th" style={{ width: '7%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                  No road hazard reports found matching current query parameters.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => {
                const isDemo = report.id.startsWith('demo-') || report.id.startsWith('rep-00');

                // Extract top 2 significant factors contributing to score
                const topFactors = (report.priority_breakdown?.factors || [])
                  .filter(f => f.score > 0)
                  .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
                  .slice(0, 2);

                return (
                  <tr key={report.id} className="triage-row">
                    <td className="triage-td" style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#38BDF8', letterSpacing: '0.02em' }}>{report.report_code}</span>
                        {isDemo ? (
                          <span className="sample-tag">Sample</span>
                        ) : (
                          <span className="user-tag">User</span>
                        )}
                      </div>
                    </td>

                    <td className="triage-td" style={{ fontWeight: 600, color: '#F1F5F9' }}>
                      {report.hazard_type.replace(/_/g, ' ').toUpperCase()}
                    </td>

                    <td className="triage-td" style={{ color: '#CBD5E1', lineHeight: 1.4 }}>
                      <div style={{ wordBreak: 'break-word' }}>
                        {report.location_name}
                      </div>
                    </td>

                    <td className="triage-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PriorityBadge level={report.priority_level} score={report.priority_score} />
                        <button
                          type="button"
                          onClick={() => setExplainingReport(report)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px'
                          }}
                          title="View exact mathematical factor breakdown"
                        >
                          <Calculator size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Main Reasons for Priority */}
                    <td className="triage-td">
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {topFactors.map((f, i) => (
                          <span
                            key={i}
                            className={`reason-chip-badge ${
                              report.priority_level === 'critical'
                                ? 'critical'
                                : report.priority_level === 'high'
                                ? 'high'
                                : ''
                            }`}
                            title={`${f.factor}: ${f.detail} (${f.score}/${f.maxScore} pts)`}
                          >
                            {f.factor.replace('Civic ', '')}: +{f.score}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="triage-td">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="triage-td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onSelectReport(report)}
                          title="Inspect details and attached evidence"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => setUpdatingReport(report)}
                          title="Update status or add maintenance note"
                        >
                          <Edit3 size={13} />
                          <span>Update</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* B. Mobile/Tablet Responsive Cards (Screens < 900px, eliminates horizontal scrollbar) */}
        <div className="triage-mobile-cards">
          {filteredReports.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              No road hazard reports found matching current query parameters.
            </div>
          ) : (
            filteredReports.map(report => {
              const isDemo = report.id.startsWith('demo-') || report.id.startsWith('rep-00');
              const topFactors = (report.priority_breakdown?.factors || [])
                .filter(f => f.score > 0)
                .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
                .slice(0, 2);

              return (
                <div key={report.id} className="triage-incident-card">
                  <div className="incident-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#38BDF8', fontSize: '0.9375rem' }}>{report.report_code}</strong>
                      {isDemo ? <span className="sample-tag">Sample</span> : <span className="user-tag">User</span>}
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <div className="incident-card-body">
                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.875rem' }}>
                      {report.hazard_type.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                      <MapPin size={13} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{report.location_name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PriorityBadge level={report.priority_level} score={report.priority_score} />
                        <button
                          type="button"
                          onClick={() => setExplainingReport(report)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title="Explain Priority"
                        >
                          <Calculator size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {topFactors.map((f, i) => (
                          <span
                            key={i}
                            className={`reason-chip-badge ${
                              report.priority_level === 'critical'
                                ? 'critical'
                                : report.priority_level === 'high'
                                ? 'high'
                                : ''
                            }`}
                          >
                            +{f.score} {f.factor.replace('Civic ', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="incident-card-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => onSelectReport(report)}
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => setUpdatingReport(report)}
                    >
                      <Edit3 size={13} />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Priority Explainer Modal */}
      {explainingReport && (
        <PriorityExplainerModal
          breakdown={explainingReport.priority_breakdown}
          reportCode={explainingReport.report_code}
          isOpen={!!explainingReport}
          onClose={() => setExplainingReport(null)}
        />
      )}

      {/* Status Update Modal */}
      {updatingReport && (
        <StatusUpdateModal
          report={updatingReport}
          isOpen={!!updatingReport}
          onClose={() => setUpdatingReport(null)}
          onUpdated={onRefresh}
        />
      )}
    </div>
  );
};
