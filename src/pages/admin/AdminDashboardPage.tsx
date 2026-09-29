import React, { useState } from 'react';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import { ReportRecord } from '../../types/database.types';
import { ReportManagementTable } from '../../components/admin/ReportManagementTable';
import { AnalyticsOverview } from '../../components/analytics/AnalyticsOverview';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { PriorityExplainerModal } from '../../components/common/PriorityExplainerModal';
import { StatusUpdateModal } from '../../components/admin/StatusUpdateModal';
import { AuthModal } from '../../components/auth/AuthModal';
import '../../styles/admin.css';
import {
  Shield,
  BarChart3,
  ListFilter,
  MapPin,
  Calculator,
  Edit3,
  X,
  Flame,
  ShieldAlert,
  Loader2,
  LogIn,
  AlertCircle,
  UserCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { reports, refreshReports } = useReports();
  const {
    user,
    role,
    isAdmin,
    isAuthenticated,
    loadingAuth,
    profileError,
    isDemoAuth,
    isSupabaseConnected,
    loginAsDemo,
    signOut
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Decision-making calculation: what needs immediate triage?
  const criticalReports = reports.filter(r => r.priority_level === 'critical' && r.status !== 'resolved');
  const highReports = reports.filter(r => r.priority_level === 'high' && r.status !== 'resolved');
  const inTriageReports = reports.filter(r => r.status !== 'resolved');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  // 1. Loading State Guard for Connected Mode
  if (isSupabaseConnected && loadingAuth) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px', borderColor: '#38BDF8' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#38BDF8' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#F8FAFC' }}>
            Verifying Authority Credentials
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            Checking authenticated Supabase session and loading authorization profile...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Guard for Connected Mode
  if (isSupabaseConnected && !isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px', borderColor: '#334155' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#38BDF8'
            }}
          >
            <Shield size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#F8FAFC' }}>Not Signed In</h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', marginBottom: '16px' }}>
            The Authority Triage Portal is restricted to authorized municipal road maintenance personnel. You are currently not signed in.
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.8125rem', marginBottom: '28px', lineHeight: 1.5 }}>
            Please sign in with your verified RoadGuard administrative account to access hazard triage, priority assignment, and dispatch controls.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('/')}>
              Return to Citizen Portal
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsAuthModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <LogIn size={16} />
              <span>Sign In to RoadGuard</span>
            </button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // 3. Profile Loading Error Guard for Connected Mode
  if (isSupabaseConnected && profileError) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px', borderColor: '#EF4444' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#EF4444'
            }}
          >
            <AlertCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#FCA5A5' }}>
            Profile Loading Error
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', marginBottom: '16px' }}>
            An authenticated Supabase session was found, but your profile in <code style={{ color: '#38BDF8' }}>public.profiles</code> could not be loaded.
          </p>
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '0.8125rem',
              color: '#F87171',
              textAlign: 'left'
            }}
          >
            <strong>Error details:</strong> {profileError}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('/')}>
              Return to Citizen Portal
            </button>
            <button className="btn btn-primary" onClick={handleSignOut}>
              Sign Out & Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Non-Admin Citizen Authorization Guard for Connected Mode
  if (isSupabaseConnected && user && !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 16px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '40px 24px', borderColor: '#DC2626' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#EF4444'
            }}
          >
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#F8FAFC' }}>
            Administrative Authorization Required
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', marginBottom: '16px' }}>
            This municipal dispatch portal is restricted to authorized personnel. Your signed-in account (
            <strong style={{ color: '#F8FAFC' }}>{user.email}</strong>) has the database-backed role:{' '}
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38BDF8',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              {role || 'CITIZEN'}
            </span>
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.8125rem', marginBottom: '28px', lineHeight: 1.5 }}>
            In Connected Mode, all administrative queries and mutations are guarded by PostgreSQL Row-Level Security (RLS)
            policies. To gain admin access, an existing administrator must assign the 'admin' role in the database for user UUID: <code style={{ color: '#38BDF8' }}>{user.id}</code>.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('/')}>
              Return to Citizen Portal
            </button>
            <button className="btn btn-primary" onClick={handleSignOut}>
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-portal-wrapper">
      {/* 1. Command Center Header & Identity Card */}
      <div className="admin-header-section">
        <div>
          <div className="admin-badge">
            <span className="admin-beacon" />
            <span className="admin-badge-prefix">AUTHORITY OPERATIONS</span>
            <span className="admin-badge-sep">/</span>
            <span className="admin-badge-sub">MUNICIPAL ROAD SAFETY</span>
          </div>

          <h1 className="admin-headline">Road Hazard Triage & Dispatch</h1>
          <p className="admin-subtitle">
            Review citizen intake, inspect rule-based priority engine justifications, and log status transitions.
          </p>
        </div>

        {/* Operational Identity Card */}
        <div className="operator-id-card">
          <div className="operator-avatar">
            <UserCheck size={20} />
          </div>
          <div className="operator-details">
            <div className="operator-tagline">
              {isSupabaseConnected ? 'AUTHENTICATED OPERATOR' : 'DEMO OPERATIONS CONSOLE'}
            </div>
            <div className="operator-name">
              {user?.full_name || (isDemoAuth ? 'Demo Authority User' : 'Authenticated Staff')}
            </div>
            <div className="operator-dept">
              {user?.department || 'Municipal Road Maintenance Team'}
            </div>
          </div>
          {isDemoAuth && role !== 'admin' && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => loginAsDemo('admin')}
              style={{ fontSize: '0.75rem', padding: '6px 10px', marginLeft: '6px' }}
            >
              Demo Admin Switch
            </button>
          )}
        </div>
      </div>

      {/* 2. Operations Status Strip (Telemetry HUD Cards) */}
      <div className="admin-telemetry-grid">
        <div className="admin-stat-card stat-critical">
          <div>
            <div className="admin-stat-label" style={{ color: '#FCA5A5' }}>CRITICAL BACKLOG</div>
            <div className="admin-stat-value" style={{ color: '#EF4444' }}>
              {criticalReports.length}
            </div>
            <div className="admin-stat-sub">Immediate dispatch needed</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#EF4444' }}>
            <Flame size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-high">
          <div>
            <div className="admin-stat-label" style={{ color: '#FDBA74' }}>HIGH PRIORITY</div>
            <div className="admin-stat-value" style={{ color: '#F97316' }}>
              {highReports.length}
            </div>
            <div className="admin-stat-sub">Supervisor review queued</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#F97316' }}>
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-triage">
          <div>
            <div className="admin-stat-label" style={{ color: '#FCD34D' }}>IN TRIAGE / ACTIVE</div>
            <div className="admin-stat-value" style={{ color: '#F59E0B' }}>
              {inTriageReports.length}
            </div>
            <div className="admin-stat-sub">Active workflow records</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#F59E0B' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="admin-stat-card stat-resolved">
          <div>
            <div className="admin-stat-label" style={{ color: '#86EFAC' }}>RESOLVED HAZARDS</div>
            <div className="admin-stat-value" style={{ color: '#10B981' }}>
              {resolvedReports.length}
            </div>
            <div className="admin-stat-sub">Repairs verified complete</div>
          </div>
          <div className="admin-stat-icon" style={{ color: '#10B981' }}>
            <Shield size={20} />
          </div>
        </div>
      </div>

      {/* 3. Operational Security & RLS Enforcement Bar */}
      <div className="admin-security-bar">
        <div className="security-bar-left">
          <ShieldAlert size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#F8FAFC' }}>
              {isSupabaseConnected ? 'Live Database Authorization:' : 'Demonstration Mode Authorization:'}
            </strong>{' '}
            {isSupabaseConnected
              ? 'Active user profile and RLS policies are enforced by PostgreSQL. All status mutations are recorded in the audit trail.'
              : 'Standalone demonstration mode with client-side role emulation. In production with Supabase connected, all status mutations are enforced at the database layer via PostgreSQL RLS policies.'}
          </span>
        </div>

        <div className="security-bar-badges">
          <span className="security-pill">RLS ENFORCED</span>
          <span className="security-pill">AUDIT TRAIL ACTIVE</span>
        </div>
      </div>

      {/* 4. Workflow Lifecycle Visual Rail */}
      <div className="lifecycle-rail">
        <div className="lifecycle-step active">
          <span>01 INGEST</span>
        </div>
        <span className="lifecycle-arrow"><ChevronRight size={14} /></span>
        <div className="lifecycle-step active">
          <span>02 TRIAGE</span>
        </div>
        <span className="lifecycle-arrow"><ChevronRight size={14} /></span>
        <div className="lifecycle-step active">
          <span>03 PRIORITIZE</span>
        </div>
        <span className="lifecycle-arrow"><ChevronRight size={14} /></span>
        <div className="lifecycle-step active">
          <span>04 DISPATCH</span>
        </div>
        <span className="lifecycle-arrow"><ChevronRight size={14} /></span>
        <div className="lifecycle-step active">
          <span>05 RESOLVE</span>
        </div>
        <span className="lifecycle-arrow"><ChevronRight size={14} /></span>
        <div className="lifecycle-step active">
          <span>06 AUDIT</span>
        </div>
      </div>

      {/* 5. Immediate Action Queue (Dispatch Alert Banner) */}
      <div className="action-queue-banner">
        <div className="action-queue-content">
          <div className="action-queue-icon">
            <Flame size={22} />
          </div>
          <div>
            <div className="action-queue-title">
              <span>IMMEDIATE ACTION QUEUE</span>
              <span className="sample-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                DISPATCH ALERT
              </span>
            </div>
            <p className="action-queue-sub">
              <strong style={{ color: '#EF4444' }}>{criticalReports.length} Critical</strong> and{' '}
              <strong style={{ color: '#F97316' }}>{highReports.length} High-Priority</strong> unresolved hazards require supervisor review and crew dispatch.
            </p>
          </div>
        </div>

        {criticalReports.length > 0 && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ fontSize: '0.75rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
            onClick={() => {
              setActiveTab('queue');
              if (criticalReports[0]) setSelectedReport(criticalReports[0]);
            }}
          >
            <span>Inspect Top Critical ({criticalReports[0]?.report_code})</span>
          </button>
        )}
      </div>

      {/* 6. Mode Switch (Command Center Segmented Control) */}
      <div className="command-mode-nav">
        <button
          type="button"
          className={`command-mode-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <ListFilter size={15} />
          <span>Priority Triage Queue</span>
          <span className="command-mode-count">{reports.length}</span>
        </button>

        <button
          type="button"
          className={`command-mode-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={15} />
          <span>Operational Analytics</span>
        </button>
      </div>

      {/* 7. Tab Content */}
      {activeTab === 'queue' ? (
        <ReportManagementTable
          reports={reports}
          onSelectReport={report => setSelectedReport(report)}
          onRefresh={refreshReports}
        />
      ) : (
        <AnalyticsOverview reports={reports} />
      )}

      {/* 8. Incident Inspection Details Modal */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  INCIDENT INSPECTION CONSOLE
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8', margin: 0 }}>
                  {selectedReport.report_code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
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

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <PriorityBadge level={selectedReport.priority_level} score={selectedReport.priority_score} />
              <StatusBadge status={selectedReport.status} />
              {selectedReport.id.startsWith('demo-') || selectedReport.id.startsWith('rep-00') ? (
                <span className="sample-tag">Sample Demonstration Data</span>
              ) : (
                <span className="user-tag">User Submitted</span>
              )}
            </div>

            {/* Evidence Image */}
            {selectedReport.image_url && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '16px', background: '#0F172A' }}>
                <img
                  src={selectedReport.image_url}
                  alt={selectedReport.hazard_type}
                  style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Spatial Location & Narrative */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
                {selectedReport.hazard_type.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '12px' }}>
                <MapPin size={15} color="#38BDF8" />
                <span>{selectedReport.location_name} (LAT {selectedReport.latitude.toFixed(4)}, LNG {selectedReport.longitude.toFixed(4)})</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Deterministic Score Driver Breakdown */}
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#38BDF8', marginBottom: '8px' }}>
                <Sparkles size={14} />
                <span>Priority Evaluation Breakdown ({selectedReport.priority_score}/100)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedReport.priority_breakdown?.factors?.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <span style={{ color: '#CBD5E1' }}>{f.factor}: {f.detail}</span>
                    <strong style={{ color: f.score > 0 ? '#38BDF8' : '#64748B' }}>+{f.score} pts</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsExplaining(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
              >
                <Calculator size={14} color="#38BDF8" />
                <span>Explain Full Formula</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsUpdating(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px' }}
              >
                <Edit3 size={14} />
                <span>Update Status / Action Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Explainer Modal */}
      {selectedReport && isExplaining && (
        <PriorityExplainerModal
          breakdown={selectedReport.priority_breakdown}
          reportCode={selectedReport.report_code}
          isOpen={isExplaining}
          onClose={() => setIsExplaining(false)}
        />
      )}

      {/* Status Update Modal */}
      {selectedReport && isUpdating && (
        <StatusUpdateModal
          report={selectedReport}
          isOpen={isUpdating}
          onClose={() => setIsUpdating(false)}
          onUpdated={() => {
            refreshReports();
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};
