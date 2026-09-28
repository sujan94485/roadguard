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
  AlertCircle
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

  const handleSignOut = async () => {
    await signOut();
    onNavigate('/');
  };

  // 1. Loading State Guard for Connected Mode
  if (isSupabaseConnected && loadingAuth) {
    return (
      <div className="container" style={{ padding: '60px 16px' }}>
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '0 auto',
            borderColor: '#38BDF8'
          }}
        >
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: '#38BDF8' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Verifying Authority Credentials</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            Checking authenticated Supabase session and loading authorization profile...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Guard for Connected Mode (Requirement 9: "Not signed in", never fake Anonymous)
  if (isSupabaseConnected && !isAuthenticated) {
    return (
      <div className="container" style={{ padding: '60px 16px' }}>
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto',
            borderColor: '#334155'
          }}
        >
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Not Signed In</h2>
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

  // 3. Profile Loading Error Guard for Connected Mode (Requirement 9)
  if (isSupabaseConnected && profileError) {
    return (
      <div className="container" style={{ padding: '60px 16px' }}>
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '580px',
            margin: '0 auto',
            borderColor: '#EF4444'
          }}
        >
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

  // 4. Non-Admin Citizen Authorization Guard for Connected Mode (Requirement 9)
  if (isSupabaseConnected && user && !isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 16px' }}>
        <div
          className="card"
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            borderColor: '#DC2626'
          }}
        >
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Administrative Authorization Required</h2>
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
    <div className="container" style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Shield size={20} color="#F59E0B" />
            <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
              {isSupabaseConnected ? 'Authority Triage Portal (Connected)' : 'Authority Triage Portal (Demonstration)'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '6px' }}>Road Hazard Triage & Dispatch</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>
            Review citizen intake, inspect rule-based priority engine justifications, and log status transitions.
          </p>
        </div>

        {/* Current Profile Badge */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1F2937',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Active Profile:</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>
              {user?.full_name || (isDemoAuth ? 'Demo Authority User' : 'Authenticated Staff')}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#38BDF8' }}>
              {user?.department || 'Municipal Road Maintenance Team'}
            </div>
          </div>
          {isDemoAuth && role !== 'admin' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => loginAsDemo('admin')}
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              Demo Admin Switch
            </button>
          )}
        </div>
      </div>

      {/* Honest Architecture & Security Note */}
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.8125rem'
        }}
      >
        <ShieldAlert size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#FBBF24' }}>
            {isSupabaseConnected ? 'Live Database Authorization:' : 'Prototype Demonstration Authorization:'}
          </strong>
          <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
            {isSupabaseConnected
              ? 'Active user profile and RLS policies are enforced by PostgreSQL. All status mutations are recorded in the audit trail.'
              : 'In this standalone demonstration mode, role switching is handled client-side for presentation convenience. In production with Supabase connected, all status mutations are enforced at the database layer via PostgreSQL RLS policies.'}
          </span>
        </div>
      </div>


      {/* Decision-Making Priority Highlight: "What should the authority address first?" */}
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderLeft: '4px solid #EF4444',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flame size={18} color="#EF4444" />
            <strong style={{ fontSize: '1rem', color: '#F8FAFC' }}>Immediate Action Queue:</strong>
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '0.875rem', margin: 0 }}>
            <strong style={{ color: '#EF4444' }}>{criticalReports.length} Critical</strong> and{' '}
            <strong style={{ color: '#F97316' }}>{highReports.length} High-Priority</strong> unresolved hazards require supervisor review and crew dispatch.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {criticalReports.length > 0 && (
            <button
              className="btn btn-danger btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => {
                setActiveTab('queue');
                if (criticalReports[0]) setSelectedReport(criticalReports[0]);
              }}
            >
              <span>Inspect Top Critical ({criticalReports[0]?.report_code})</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #1F2937', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('queue')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'queue' ? '#1E293B' : 'transparent',
            color: activeTab === 'queue' ? '#38BDF8' : '#94A3B8',
            fontWeight: activeTab === 'queue' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <ListFilter size={16} />
          <span>Priority Triage Queue ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'analytics' ? '#1E293B' : 'transparent',
            color: activeTab === 'analytics' ? '#38BDF8' : '#94A3B8',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <BarChart3 size={16} />
          <span>Operational Analytics</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' ? (
        <ReportManagementTable
          reports={reports}
          onSelectReport={report => setSelectedReport(report)}
          onRefresh={refreshReports}
        />
      ) : (
        <AnalyticsOverview reports={reports} />
      )}

      {/* Report Inspection Modal (Details) */}
      {selectedReport && (
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
          onClick={() => setSelectedReport(null)}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '24px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Hazard Review</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>
                  {selectedReport.report_code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
              <PriorityBadge level={selectedReport.priority_level} score={selectedReport.priority_score} />
              <StatusBadge status={selectedReport.status} />
              {selectedReport.id.startsWith('demo-') ? (
                <span className="sample-tag">Sample Demonstration Data</span>
              ) : (
                <span className="user-tag">User Submitted</span>
              )}
            </div>

            {selectedReport.image_url && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #1F2937', marginBottom: '16px' }}>
                <img
                  src={selectedReport.image_url}
                  alt={selectedReport.hazard_type}
                  style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            <div
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '4px' }}>
                {selectedReport.hazard_type.replace(/_/g, ' ').toUpperCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '12px' }}>
                <MapPin size={15} color="#38BDF8" />
                <span>{selectedReport.location_name} ({selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)})</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Top Score Drivers */}
            <div style={{ backgroundColor: '#1E293B', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
                Priority Evaluation Breakdown ({selectedReport.priority_score}/100)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedReport.priority_breakdown?.factors?.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#CBD5E1' }}>{f.factor}: {f.detail}</span>
                    <strong style={{ color: f.score > 0 ? '#38BDF8' : '#64748B' }}>+{f.score} pts</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsExplaining(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} color="#38BDF8" />
                <span>Explain Full Formula</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsUpdating(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
