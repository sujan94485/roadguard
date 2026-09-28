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
import { AlertTriangle, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div className="grid-4">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600 }}>Total Reports</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0' }}>
                {totalReports}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Demonstration intake records</div>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1E293B', color: '#38BDF8' }}>
              <Clock size={20} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#FCA5A5', fontWeight: 600 }}>Critical Backlog</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444', margin: '4px 0' }}>
                {criticalCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Immediate intervention required</div>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#FCD34D', fontWeight: 600 }}>Active Triage</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', margin: '4px 0' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Under active maintenance review</div>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
              <ShieldAlert size={20} />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#6EE7B7', fontWeight: 600 }}>Resolution Rate</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: '4px 0' }}>
                {resolutionRate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{resolvedCount} closed hazards</div>
            </div>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid-2">
        {/* Reports by Hazard Type */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Reports by Hazard Category</h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            Identifies leading road defect classifications across the municipality.
          </p>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Priority Level Distribution</h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '16px' }}>
            Evaluated by the transparent Road Hazard Priority Engine.
          </p>
          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
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
