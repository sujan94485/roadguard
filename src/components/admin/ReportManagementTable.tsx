import React, { useState } from 'react';
import { ReportRecord } from '../../types/database.types';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { PriorityExplainerModal } from '../common/PriorityExplainerModal';
import { StatusUpdateModal } from './StatusUpdateModal';
import { Calculator, Edit3, Eye, Search, Filter, AlertTriangle } from 'lucide-react';

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
      r.report_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hazard_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority_level === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Table Filter Controls */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111827',
          padding: '14px 18px',
          borderRadius: '8px',
          border: '1px solid #1F2937'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Report ID, street, or hazard type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="#94A3B8" />
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <select
            className="form-control"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.8125rem', width: 'auto' }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table Element */}
      <div
        className="table-responsive"
        style={{
          overflowX: 'auto',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px solid #1F2937'
        }}
      >
        <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0B0F19', borderBottom: '1px solid #1F2937', color: '#94A3B8' }}>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Report ID</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Hazard</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Priority & Score</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Main Reasons for Priority</th>
              <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                  No road hazard reports found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => {
                const isDemo = report.id.startsWith('demo-') || report.id.startsWith('rep-00');

                // Extract top 2 significant factors contributing to score
                const topFactors = (report.priority_breakdown?.factors || [])
                  .filter(f => f.score > 0)
                  .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore))
                  .slice(0, 2);

                return (
                  <tr
                    key={report.id}
                    style={{
                      borderBottom: '1px solid #1E293B',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1E293B')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#38BDF8' }}>{report.report_code}</span>
                        {isDemo ? (
                          <span className="sample-tag">Sample</span>
                        ) : (
                          <span className="user-tag">User</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#F1F5F9', whiteSpace: 'nowrap' }}>
                      {report.hazard_type.replace(/_/g, ' ').toUpperCase()}
                    </td>

                    <td style={{ padding: '12px 14px', color: '#CBD5E1', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.location_name}
                    </td>

                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PriorityBadge level={report.priority_level} score={report.priority_score} />
                        <button
                          onClick={() => setExplainingReport(report)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="View exact mathematical factor breakdown"
                        >
                          <Calculator size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Main Reasons for Priority (Prominent Triage Driver) */}
                    <td style={{ padding: '12px 14px', maxWidth: '260px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {topFactors.map((f, i) => (
                          <span
                            key={i}
                            className={`reason-chip ${report.priority_level === 'critical' ? 'reason-chip-critical' : report.priority_level === 'high' ? 'reason-chip-high' : ''}`}
                            title={`${f.factor}: ${f.detail} (${f.score}/${f.maxScore} pts)`}
                          >
                            {f.factor.replace('Civic ', '')}: +{f.score}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={report.status} />
                    </td>

                    <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onSelectReport(report)}
                          title="Inspect details and attached evidence"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>

                        <button
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
