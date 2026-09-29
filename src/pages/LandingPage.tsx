import React from 'react';
import { useReports } from '../hooks/useReports';
import { SafetyMap } from '../components/map/SafetyMap';
import { CivicNetworkCanvas } from '../components/home/CivicNetworkCanvas';
import { TelemetryHUD } from '../components/home/TelemetryHUD';
import { PriorityFormulaPreview } from '../components/home/PriorityFormulaPreview';
import '../styles/landing.css';
import {
  ShieldAlert,
  ArrowRight,
  MapPin,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  Activity,
  Zap,
  Crosshair,
  ShieldCheck,
  Search,
  Radio,
  Sliders,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { reports } = useReports();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ==================================================================
          1. HERO SECTION: CINEMATIC SPATIAL INTELLIGENCE PLATFORM
          ================================================================== */}
      <section className="hero-spatial-container">
        <div className="hero-spatial-grid-bg" />

        <div className="container hero-content-wrapper">
          <div className="hero-main-grid">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="hero-left-column">
              {/* Civic Badge Pill */}
              <div className="civic-badge-pill">
                <span className="live-beacon" />
                <span className="civic-badge-text">Intelligent Civic Infrastructure</span>
                <span className="civic-badge-tag">SPATIAL TRIAGE</span>
              </div>

              {/* Large Editorial Headline */}
              <h1 className="hero-headline">
                Smarter reporting.{' '}
                <span className="hero-headline-accent">Safer roads.</span>
              </h1>

              {/* Supporting Text */}
              <p className="hero-subheading">
                RoadGuard empowers citizens to report street hazards, visualizes geographic risk in real time, prioritizes repair operations with transparent mathematical explainability, and tracks resolution to completion.
              </p>

              {/* Premium Dual Call To Action */}
              <div className="hero-cta-group">
                <button
                  className="btn-hero-primary"
                  onClick={() => onNavigate('/report')}
                  id="hero-report-btn"
                >
                  <span>Report a Hazard</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  className="btn-hero-secondary"
                  onClick={() => onNavigate('/map')}
                  id="hero-explore-map-btn"
                >
                  <MapPin size={17} color="#38BDF8" />
                  <span>Explore Safety Map</span>
                </button>
              </div>

              {/* Core Engineering Specs Bar */}
              <div className="hero-specs-bar">
                <div className="hero-spec-item">
                  <span className="hero-spec-icon">
                    <Cpu size={15} />
                  </span>
                  <span>Deterministic 0–100 Priority Engine</span>
                </div>
                <div className="hero-spec-item">
                  <span className="hero-spec-icon">
                    <Crosshair size={15} />
                  </span>
                  <span>GPS Spatial Geocoding</span>
                </div>
                <div className="hero-spec-item">
                  <span className="hero-spec-icon">
                    <ShieldCheck size={15} />
                  </span>
                  <span>Auditable Public Lifecycle</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D-Inspired Civic Road Network Visualization */}
            <div style={{ position: 'relative' }}>
              <CivicNetworkCanvas />
            </div>
          </div>

          {/* Real-time Hero Telemetry HUD Indicators */}
          <div style={{ marginTop: '24px' }}>
            <TelemetryHUD reports={reports} />
          </div>
        </div>
      </section>

      {/* ==================================================================
          2. THE ROAD SAFETY PROBLEM: THE CIVIC DISCONNECT
          ================================================================== */}
      <section className="story-section container">
        <div className="story-section-connector" />

        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 48px auto' }}>
          <div className="section-eyebrow">
            <Radio size={14} />
            <span>The Civic Infrastructure Challenge</span>
          </div>
          <h2 className="section-title">Why Road Hazards Remain Unresolved</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Every year, deep potholes, malfunctioning signals, and unlit corridors cause preventable vehicle damage and accidents because traditional municipal reporting lacks objective prioritization.
          </p>
        </div>

        <div className="grid-3">
          {/* Problem Card 1: Fragmented Intake */}
          <div className="problem-card problem-card-critical">
            <div
              className="problem-icon-wrapper"
              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <AlertTriangle size={22} color="#EF4444" />
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6875rem',
                color: '#EF4444',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}
            >
              DEFECT INTAKE GAP
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#F8FAFC' }}>
              Fragmented Intake
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Citizens submit through disparate phone lines, social posts, and paper forms with no verified coordinates, no photographic proof, and no uniform classification.
            </p>
          </div>

          {/* Problem Card 2: Opaque Prioritization */}
          <div className="problem-card problem-card-high">
            <div
              className="problem-icon-wrapper"
              style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
            >
              <Clock size={22} color="#F59E0B" />
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6875rem',
                color: '#F59E0B',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}
            >
              ARBITRARY QUEUES
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#F8FAFC' }}>
              Opaque Prioritization
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Work orders are scheduled on a first-come basis or political pressure. Critical arterial hazards near school and hospital zones are often delayed behind minor cosmetic fixes.
            </p>
          </div>

          {/* Problem Card 3: The Civic Black Hole */}
          <div className="problem-card problem-card-cyan">
            <div
              className="problem-icon-wrapper"
              style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
            >
              <Layers size={22} color="#38BDF8" />
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6875rem',
                color: '#38BDF8',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '8px'
              }}
            >
              ZERO FEEDBACK LOOP
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: '#F8FAFC' }}>
              The "Black Hole" Effect
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 }}>
              After filing a complaint, citizens receive no status updates or resolution proof. Lack of municipal transparency erodes public trust and discourages civic participation.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================
          3. HOW ROADGUARD WORKS: 5-STAGE CLOSED-LOOP CIVIC ARCHITECTURE
          REPORT → PRIORITIZE → VISUALIZE → ACT → TRACK
          ================================================================== */}
      <section
        style={{
          background: 'linear-gradient(180deg, #070A12 0%, #0F172A 50%, #070A12 100%)',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
          padding: '64px 0',
          position: 'relative'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 40px auto' }}>
            <div className="section-eyebrow">
              <Zap size={14} />
              <span>Closed-Loop Civic Architecture</span>
            </div>
            <h2 className="section-title">How RoadGuard Solves It</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              A verifiable five-stage operational framework connecting citizens with municipal public works departments:
            </p>
          </div>

          {/* 5-Step Continuous Progress Rail */}
          <div className="workflow-rail">
            {/* Step 1: REPORT */}
            <div className="workflow-node">
              <div className="workflow-step-num" style={{ color: '#38BDF8' }}>
                01
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Crosshair size={14} color="#38BDF8" />
                <span style={{ fontSize: '0.6875rem', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.08em' }}>
                  INTAKE
                </span>
              </div>
              <h3 className="workflow-step-title">REPORT</h3>
              <p className="workflow-step-desc">
                Citizens pinpoint coordinates on the map, select defect classification, and attach photographic evidence with optional assistive AI detection.
              </p>
            </div>

            {/* Step 2: PRIORITIZE */}
            <div className="workflow-node">
              <div className="workflow-step-num" style={{ color: '#F97316' }}>
                02
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sliders size={14} color="#F97316" />
                <span style={{ fontSize: '0.6875rem', color: '#F97316', fontWeight: 700, letterSpacing: '0.08em' }}>
                  SCORING
                </span>
              </div>
              <h3 className="workflow-step-title">PRIORITIZE</h3>
              <p className="workflow-step-desc">
                Deterministic rule engine weights Severity + Traffic Exposure + School/Hospital Zones + Clustering + Aging into an explainable 0–100 score.
              </p>
            </div>

            {/* Step 3: VISUALIZE */}
            <div className="workflow-node">
              <div className="workflow-step-num" style={{ color: '#F59E0B' }}>
                03
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Activity size={14} color="#F59E0B" />
                <span style={{ fontSize: '0.6875rem', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.08em' }}>
                  SPATIAL GIS
                </span>
              </div>
              <h3 className="workflow-step-title">VISUALIZE</h3>
              <p className="workflow-step-desc">
                Interactive safety map displays geographic hazards with color-coded risk markers and spatial clustering to reveal neighborhood danger hotspots.
              </p>
            </div>

            {/* Step 4: ACT */}
            <div className="workflow-node">
              <div className="workflow-step-num" style={{ color: '#10B981' }}>
                04
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <ShieldCheck size={14} color="#10B981" />
                <span style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 700, letterSpacing: '0.08em' }}>
                  MUNICIPAL
                </span>
              </div>
              <h3 className="workflow-step-title">ACT</h3>
              <p className="workflow-step-desc">
                Authority supervisors triage highest-priority items first, assign municipal repair crews, and document status updates with notes.
              </p>
            </div>

            {/* Step 5: TRACK */}
            <div className="workflow-node">
              <div className="workflow-step-num" style={{ color: '#8B5CF6' }}>
                05
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CheckCircle2 size={14} color="#8B5CF6" />
                <span style={{ fontSize: '0.6875rem', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.08em' }}>
                  AUDIT
                </span>
              </div>
              <h3 className="workflow-step-title">TRACK</h3>
              <p className="workflow-step-desc">
                Citizens enter their unique Report ID anytime to inspect real-time operational status, review timestamped changes, and verify completion.
              </p>
            </div>
          </div>

          {/* Interactive Priority Formula Inspector */}
          <PriorityFormulaPreview />
        </div>
      </section>

      {/* ==================================================================
          4. SAFETY MAP PREVIEW: SPATIAL OPERATIONS TERMINAL
          ================================================================== */}
      <section className="story-section container">
        <div className="story-section-connector" />

        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div className="section-eyebrow">
              <MapPin size={14} />
              <span>Spatial Safety Intelligence (Demonstration)</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: '8px' }}>
              Safety Map Preview
            </h2>
            <p className="section-subtitle">
              Visualizing active hazard reports across the Mysuru demonstration corridor with multi-factor risk categorization.
            </p>
          </div>

          <button
            className="btn-hero-secondary"
            onClick={() => onNavigate('/map')}
            id="map-preview-open-btn"
          >
            <span>Launch Fullscreen Map</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Map Operations Terminal Frame */}
        <div className="map-preview-terminal">
          {/* Terminal Status Bar */}
          <div className="map-terminal-header">
            <div className="map-terminal-title">
              <span className="live-beacon" />
              <span>SPATIAL INCIDENT TELEMETRY // CORRIDOR VIEW</span>
            </div>

            <div className="map-terminal-indicators">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="map-terminal-dot" style={{ backgroundColor: '#EF4444' }} />
                <span style={{ color: '#FCA5A5' }}>Critical (≥85)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="map-terminal-dot" style={{ backgroundColor: '#F97316' }} />
                <span style={{ color: '#FDBA74' }}>High (65–84)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="map-terminal-dot" style={{ backgroundColor: '#F59E0B' }} />
                <span style={{ color: '#FCD34D' }}>Medium (40–64)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="map-terminal-dot" style={{ backgroundColor: '#10B981' }} />
                <span style={{ color: '#6EE7B7' }}>Low (&lt;40)</span>
              </div>
            </div>
          </div>

          {/* Leaflet Interactive Map */}
          <SafetyMap reports={reports} height="460px" />
        </div>
      </section>

      {/* ==================================================================
          5. CALL TO ACTION: CIVIC ACCELERATOR HUB
          ================================================================== */}
      <section className="container" style={{ paddingBottom: '70px' }}>
        <div className="cta-hub-card">
          <div className="section-eyebrow" style={{ justifyContent: 'center', marginBottom: '14px' }}>
            <ShieldAlert size={14} />
            <span>Civic Engagement</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#F8FAFC', marginBottom: '16px', letterSpacing: '-0.025em' }}>
            Ready to make your neighborhood streets safer?
          </h2>

          <p
            style={{
              color: '#94A3B8',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 36px auto'
            }}
          >
            File a geotagged hazard report with photo evidence in under 60 seconds. Every submission receives an auditable tracking code and deterministic priority score.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="btn-hero-primary"
              onClick={() => onNavigate('/report')}
              id="cta-report-btn"
            >
              <span>File a Hazard Report</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="btn-hero-secondary"
              onClick={() => onNavigate('/track')}
              id="cta-track-btn"
            >
              <FileText size={17} color="#38BDF8" />
              <span>Track Existing Report</span>
            </button>
          </div>

          {/* Sample Tracking Quick Link */}
          <div
            style={{
              marginTop: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              color: '#94A3B8'
            }}
          >
            <Search size={13} color="#38BDF8" />
            <span>Try sample demonstration report code:</span>
            <button
              onClick={() => onNavigate('/track/RG-2026-0012')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              RG-2026-0012
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
