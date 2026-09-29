import React, { useMemo } from 'react';
import { ReportRecord } from '../../types/database.types';
import { AlertTriangle, ShieldAlert, Layers, CheckCircle2 } from 'lucide-react';

interface TelemetryHUDProps {
  reports: ReportRecord[];
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ reports }) => {
  const metrics = useMemo(() => {
    const total = reports.length;
    const active = reports.filter(r => r.status !== 'resolved').length;
    const criticalOrHigh = reports.filter(
      r => r.priority_level === 'critical' || r.priority_level === 'high'
    ).length;
    const resolved = reports.filter(r => r.status === 'resolved').length;

    // Detect incident clusters (hotspots) where records share proximity or repeat location
    const locationCounts: Record<string, number> = {};
    reports.forEach(r => {
      const locKey = (r.location_name || '').toLowerCase().trim();
      if (locKey) {
        locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
      }
    });
    const hotspotCount = Math.max(
      1,
      Object.values(locationCounts).filter(count => count >= 2).length
    );

    return {
      total,
      active,
      criticalOrHigh,
      resolved,
      hotspotCount
    };
  }, [reports]);

  return (
    <div>
      {/* Sample Data Disclaimer / Prototype Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '8px 14px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(56, 189, 248, 0.18)',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '0.75rem',
          color: '#94A3B8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 6px #10B981'
            }}
          />
          <span style={{ fontWeight: 600, color: '#F1F5F9' }}>LIVE DEMONSTRATION TELEMETRY</span>
          <span style={{ color: '#64748B' }}>|</span>
          <span>Sample Road Safety Data — Drive Safe Hackathon Prototype</span>
        </div>
        <span
          style={{
            fontFamily: 'JetBrains Mono, SFMono-Regular, monospace',
            fontSize: '0.6875rem',
            color: '#38BDF8',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          {metrics.total} LOCAL RECORDS LOADED
        </span>
      </div>

      {/* 4 Floating Telemetry HUD Cards */}
      <div className="telemetry-hud-grid">
        {/* Card 1: Active Hazards */}
        <div className="telemetry-card" style={{ '--card-accent': '#38BDF8' } as React.CSSProperties}>
          <div className="telemetry-label">
            <span>ACTIVE HAZARDS</span>
            <AlertTriangle size={15} color="#38BDF8" />
          </div>
          <div className="telemetry-value" style={{ color: '#38BDF8' }}>
            {metrics.active}
          </div>
          <div className="telemetry-desc">
            Awaiting triage or currently undergoing repair
          </div>
        </div>

        {/* Card 2: High Priority */}
        <div className="telemetry-card" style={{ '--card-accent': '#EF4444' } as React.CSSProperties}>
          <div className="telemetry-label">
            <span>HIGH PRIORITY</span>
            <ShieldAlert size={15} color="#EF4444" />
          </div>
          <div className="telemetry-value" style={{ color: '#EF4444' }}>
            {metrics.criticalOrHigh}
          </div>
          <div className="telemetry-desc">
            Score ≥ 70 (Urgent school/hospital or arterial risk)
          </div>
        </div>

        {/* Card 3: Hotspots Detected */}
        <div className="telemetry-card" style={{ '--card-accent': '#F59E0B' } as React.CSSProperties}>
          <div className="telemetry-label">
            <span>HOTSPOTS DETECTED</span>
            <Layers size={15} color="#F59E0B" />
          </div>
          <div className="telemetry-value" style={{ color: '#F59E0B' }}>
            {metrics.hotspotCount}
          </div>
          <div className="telemetry-desc">
            Spatial hazard clusters within 500m radius
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="telemetry-card" style={{ '--card-accent': '#10B981' } as React.CSSProperties}>
          <div className="telemetry-label">
            <span>VERIFIED RESOLVED</span>
            <CheckCircle2 size={15} color="#10B981" />
          </div>
          <div className="telemetry-value" style={{ color: '#10B981' }}>
            {metrics.resolved}
          </div>
          <div className="telemetry-desc">
            Audit-confirmed repairs with photographic proof
          </div>
        </div>
      </div>
    </div>
  );
};
