import React, { useMemo } from 'react';
import { ReportRecord } from '../../types/database.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, BarChart2, PieChart as PieIcon, Activity } from 'lucide-react';

interface AnalyticsOverviewProps {
  reports: ReportRecord[];
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981'
};

const STATUS_COLORS: Record<string, string> = {
  submitted: '#94A3B8',
  under_review: '#38BDF8',
  in_progress: '#F59E0B',
  resolved: '#10B981'
};

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ reports }) => {
  // KPI Calculations
  const totalReports = reports.length;
  const criticalCount = reports.filter(r => r.priority_level === 'critical' && r.status !== 'resolved').length;
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;

  // Hazard Type Distribution
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach(r => {
      const label = r.hazard_type.replace(/_/g, ' ');
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count
    }));
  }, [reports]);

  // Priority Distribution
  const priorityData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    reports.forEach(r => {
      if (counts[r.priority_level] !== undefined) {
        counts[r.priority_level]++;
      }
    });

    return [
      { name: 'Critical', value: counts.critical, color: PRIORITY_COLORS.critical },
      { name: 'High', value: counts.high, color: PRIORITY_COLORS.high },
      { name: 'Medium', value: counts.medium, color: PRIORITY_COLORS.medium },
      { name: 'Low', value: counts.low, color: PRIORITY_COLORS.low }
    ];
  }, [reports]);

  // Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { submitted: 0, under_review: 0, in_progress: 0, resolved: 0 };
    reports.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });

    return [
      { name: 'Submitted', value: counts.submitted, color: STATUS_COLORS.submitted },
      { name: 'Under Review', value: counts.under_review, color: STATUS_COLORS.under_review },
      { name: 'In Progress', value: counts.in_progress, color: STATUS_COLORS.in_progress },
      { name: 'Resolved', value: counts.resolved, color: STATUS_COLORS.resolved }
    ];
  }, [reports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. KPI Cards */}
      <div className="admin-telemetry-grid">
        <div className="admin-stat-card stat-triage">
          <div>
            <div className="admin-stat-label">TOTAL INTAKE</div>
            <div className="admin-stat-value" style={{ color: '#F8FAFC' }}>{totalReports}</div>
            <div className="admin-stat-sub">Ingested roadway records</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#38BDF8' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-critical">
          <div>
            <div className="admin-stat-label" style={{ color: '#FCA5A5' }}>CRITICAL BACKLOG</div>
            <div className="admin-stat-value" style={{ color: '#EF4444' }}>{criticalCount}</div>
            <div className="admin-stat-sub">Immediate dispatch required</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#EF4444' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-high">
          <div>
            <div className="admin-stat-label" style={{ color: '#FCD34D' }}>ACTIVE MAINTENANCE</div>
            <div className="admin-stat-value" style={{ color: '#F59E0B' }}>{inProgressCount}</div>
            <div className="admin-stat-sub">Crews currently deployed</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#F59E0B' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-resolved">
          <div>
            <div className="admin-stat-label" style={{ color: '#86EFAC' }}>RESOLUTION RATE</div>
            <div className="admin-stat-value" style={{ color: '#10B981' }}>{resolutionRate}%</div>
            <div className="admin-stat-sub">{resolvedCount} verified fixes</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#10B981' }}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* 2. Operational Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Reports by Hazard Type */}
        <div className="triage-table-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <BarChart2 size={16} color="#38BDF8" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Reports by Hazard Classification
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            Defect frequency across municipal transit corridors.
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="triage-table-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <PieIcon size={16} color="#F59E0B" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Priority Level Distribution
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            Evaluated by the transparent Road Hazard Priority Engine.
          </p>
          <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Status Breakdown */}
        <div className="triage-table-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={16} color="#10B981" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              Resolution Pipeline Status
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            Incident lifecycle progression through dispatch stages.
          </p>
          <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderRadius: '8px',
                    color: '#F8FAFC'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
