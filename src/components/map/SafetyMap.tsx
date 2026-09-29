import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ReportRecord } from '../../types/database.types';
import { OPENSTREETMAP_PROVIDER, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../services/mapConfig';

interface SafetyMapProps {
  reports: ReportRecord[];
  selectedReportId?: string | null;
  onSelectReport?: (report: ReportRecord) => void;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  height = '620px',
  zoom = DEFAULT_MAP_ZOOM,
  center = DEFAULT_MAP_CENTER
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = center || DEFAULT_MAP_CENTER;
    const initialZoom = zoom || DEFAULT_MAP_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      attributionControl: true
    });

    // Reliable, standard OpenStreetMap tiles with dark civic-tech integration filter
    L.tileLayer(OPENSTREETMAP_PROVIDER.url, {
      attribution: OPENSTREETMAP_PROVIDER.attribution,
      maxZoom: OPENSTREETMAP_PROVIDER.maxZoom,
      subdomains: OPENSTREETMAP_PROVIDER.subdomains
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Invalidate size on load to prevent rendering artifacts
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom]);

  // Update Markers when reports or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const getMarkerIcon = (priorityLevel: string, isSelected: boolean) => {
      const size: [number, number] = isSelected ? [36, 48] : [28, 38];
      const anchor: [number, number] = isSelected ? [18, 48] : [14, 38];

      return L.icon({
        iconUrl: `/markers/marker-${priorityLevel}.svg`,
        iconSize: size,
        iconAnchor: anchor,
        popupAnchor: [0, -38]
      });
    };

    const priorityColors: Record<string, string> = {
      critical: '#EF4444',
      high: '#F97316',
      medium: '#F59E0B',
      low: '#10B981'
    };

    reports.forEach(report => {
      const isSelected = report.id === selectedReportId;
      const marker = L.marker([report.latitude, report.longitude], {
        icon: getMarkerIcon(report.priority_level, isSelected),
        title: `${report.report_code}: ${report.hazard_type}`
      });

      // Dark obsidian popup HTML
      const isDemo = report.id.startsWith('demo-') || report.id.startsWith('rep-00');
      const pColor = priorityColors[report.priority_level] || '#38BDF8';
      const statusLabel = report.status.replace(/_/g, ' ');

      const popupHtml = `
        <div style="font-family: inherit; font-size: 0.8125rem; min-width: 200px; color: #F8FAFC;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: #38BDF8; font-size: 0.875rem; letter-spacing: 0.02em;">${report.report_code}</strong>
            <span style="font-weight: 700; text-transform: uppercase; font-size: 0.625rem; padding: 2px 6px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3);">
              ${statusLabel}
            </span>
          </div>
          <div style="font-weight: 700; color: #F8FAFC; margin-bottom: 4px; font-size: 0.8125rem;">
            ${report.hazard_type.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div style="color: #94A3B8; font-size: 0.75rem; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            📍 ${report.location_name}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 6px;">
            <span style="color: #94A3B8;">Priority: <strong style="color: ${pColor};">${report.priority_level.toUpperCase()} (${report.priority_score})</strong></span>
            ${isDemo ? '<span style="font-size: 0.5625rem; background: rgba(255, 255, 255, 0.1); color: #94A3B8; padding: 1px 4px; border-radius: 3px; font-weight: 700;">DEMO</span>' : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, selectedReportId, onSelectReport]);

  // Center on selected report if set
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedReportId) return;
    const selected = reports.find(r => r.id === selectedReportId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.latitude, selected.longitude], { animate: true, duration: 0.4 });
    }
  }, [selectedReportId, reports]);

  // Dynamic Telemetry Metrics derived strictly from existing report records
  const criticalCount = reports.filter(r => r.priority_level === 'critical').length;
  const highCount = reports.filter(r => r.priority_level === 'high').length;
  const highRiskTotal = criticalCount + highCount;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const activeCount = reports.filter(r => r.status !== 'resolved').length;

  return (
    <div
      className="spatial-map-stage"
      style={{
        position: 'relative',
        width: '100%',
        height
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Telemetry HUD Overlay (Top-Left) */}
      <div className="map-hud-overlay">
        <div className="map-hud-pill">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 6px #38BDF8' }} />
          <span>MAP TELEMETRY:</span>
          <span className="map-hud-pill-highlight">{reports.length} VISIBLE</span>
          <span style={{ color: '#64748B' }}>|</span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px #EF4444' }} />
          <span>HIGH RISK:</span>
          <span style={{ fontWeight: 700, color: '#FCA5A5' }}>{highRiskTotal}</span>
        </div>
        <div className="map-hud-pill">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
          <span>ACTIVE:</span>
          <span style={{ fontWeight: 700, color: '#FCD34D' }}>{activeCount}</span>
          <span style={{ color: '#64748B' }}>|</span>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          <span>RESOLVED:</span>
          <span style={{ fontWeight: 700, color: '#86EFAC' }}>{resolvedCount}</span>
        </div>
      </div>

      {/* Risk Intelligence Legend (Bottom-Right) */}
      <div className="spatial-legend-panel">
        <div className="legend-header">
          <span className="legend-title">RISK PRIORITY MATRIX</span>
          <span className="legend-tag">DEMO</span>
        </div>
        
        <div className="legend-item">
          <div className="legend-item-left">
            <span className="legend-dot" style={{ backgroundColor: '#EF4444', color: '#EF4444' }} />
            <span>Critical</span>
          </div>
          <span className="legend-range">85–100</span>
        </div>

        <div className="legend-item">
          <div className="legend-item-left">
            <span className="legend-dot" style={{ backgroundColor: '#F97316', color: '#F97316' }} />
            <span>High</span>
          </div>
          <span className="legend-range">65–84</span>
        </div>

        <div className="legend-item">
          <div className="legend-item-left">
            <span className="legend-dot" style={{ backgroundColor: '#F59E0B', color: '#F59E0B' }} />
            <span>Medium</span>
          </div>
          <span className="legend-range">40–64</span>
        </div>

        <div className="legend-item">
          <div className="legend-item-left">
            <span className="legend-dot" style={{ backgroundColor: '#10B981', color: '#10B981' }} />
            <span>Low</span>
          </div>
          <span className="legend-range">0–39</span>
        </div>

        <div className="legend-footer">
          RULE-BASED SCORING
        </div>
      </div>
    </div>
  );
};
