import React from 'react';
import { useReports } from '../hooks/useReports';
import { SafetyMap } from '../components/map/SafetyMap';
import {
  ShieldAlert,
  ArrowRight,
  MapPin,
  CheckCircle,
  Clock,
  Layers,
  BarChart3,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { reports } = useReports();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
      {/* 1. HERO SECTION */}
      <section style={{ padding: '60px 0 20px 0', borderBottom: '1px solid #1F2937' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38BDF8',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '20px'
              }}
            >
              <ShieldAlert size={14} />
              <span>Civic Road-Safety Infrastructure Platform</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '20px'
              }}
            >
              Smarter reporting. <br />
              <span style={{ color: '#38BDF8' }}>Safer roads.</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: '#CBD5E1',
                lineHeight: 1.6,
                marginBottom: '36px',
                maxWidth: '720px',
                margin: '0 auto 36px auto'
              }}
            >
              RoadGuard helps communities report road hazards, visualize risk, prioritize action with transparent explainability, and track resolution.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate('/report')}>
                <span>Report a Hazard</span>
                <ArrowRight size={18} />
              </button>

              <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('/map')}>
                <MapPin size={18} color="#38BDF8" />
                <span>Explore Safety Map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM */}
      <section className="container">
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.875rem', marginBottom: '12px' }}>The Core Civic Problem</h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6 }}>
            Road hazards such as deep potholes, broken traffic signals, poor street lighting, and waterlogging frequently remain unresolved.
          </p>
        </div>

        <div className="grid-3">
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: '#EF4444', marginBottom: '12px' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Fragmented Reporting</h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Citizens report through disparate call centers, emails, and social media posts with no uniform standard or visual evidence.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: '#F59E0B', marginBottom: '12px' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>Opaque Prioritization</h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
              Authorities lack an objective, transparent framework to distinguish minor cosmetic defects from urgent life-safety threats.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: '#38BDF8', marginBottom: '12px' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '8px' }}>The "Black Hole" Effect</h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
              After submitting, citizens never receive verification or timeline updates, eroding civic trust and community participation.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE SOLUTION & WORKFLOW */}
      <section style={{ backgroundColor: '#111827', borderTop: '1px solid #1F2937', borderBottom: '1px solid #1F2937', padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px auto' }}>
            <h2 style={{ fontSize: '1.875rem', marginBottom: '12px' }}>The RoadGuard Workflow</h2>
            <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
              A closed-loop civic road-safety architecture: REPORT → PRIORITIZE → VISUALIZE → ACT → TRACK
            </p>
          </div>

          <div className="grid-4">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38BDF8' }}>01</div>
              <h4 style={{ fontSize: '1.0625rem' }}>Citizen Reports</h4>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Citizen drops GPS pin, selects hazard classification, and uploads photographic evidence with optional assistive AI.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>02</div>
              <h4 style={{ fontSize: '1.0625rem' }}>Priority Engine</h4>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Deterministic rule engine weights Severity + Traffic Exposure + School/Hospital Zones + Clustering + Aging into a 0–100 score.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>03</div>
              <h4 style={{ fontSize: '1.0625rem' }}>Authority Review</h4>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Municipal supervisors review prioritized triage queues, inspect transparent scoring reasons, and log status updates.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8B5CF6' }}>04</div>
              <h4 style={{ fontSize: '1.0625rem' }}>Track Resolution</h4>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Citizens enter their Report ID anytime to inspect operational progress and read administrative notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SAFETY MAP PREVIEW */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Interactive Safety Map (Demonstration)
            </div>
            <h2 style={{ fontSize: '1.75rem' }}>Safety Map Preview</h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
              Visualizing reported road hazards with priority levels across the demonstration area.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('/map')}>
            <span>Open Safety Map</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <SafetyMap reports={reports} height="440px" />
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="container" style={{ marginBottom: '40px' }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, #111827 0%, #0F172A 100%)',
            border: '1px solid #374151',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Ready to improve road safety in your city?</h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 28px auto' }}>
            Report a pothole, broken signal, or dark roadway segment in less than 60 seconds and watch it move through the municipal resolution lifecycle.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('/report')}>
              <span>File a Hazard Report</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('/track')}>
              <FileText size={18} />
              <span>Track an Existing Report</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
