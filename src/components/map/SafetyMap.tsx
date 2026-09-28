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
  height = '600px',
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

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true
    });

    // Reliable, standard OpenStreetMap tiles (No API key required)
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
  }, [zoom]);

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

    reports.forEach(report => {
      const isSelected = report.id === selectedReportId;
      const marker = L.marker([report.latitude, report.longitude], {
        icon: getMarkerIcon(report.priority_level, isSelected),
        title: `${report.report_code}: ${report.hazard_type}`
      });

      // Custom Popup HTML
      const isDemo = report.id.startsWith('demo-') || report.id.startsWith('rep-00');
      const popupHtml = `
        <div style="font-family: inherit; font-size: 0.8125rem; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: #0284C7; font-size: 0.875rem;">${report.report_code}</strong>
            <span style="font-weight: 700; text-transform: uppercase; font-size: 0.6875rem; padding: 2px 6px; border-radius: 4px; background: #E0F2FE; color: #0369A1;">
              ${report.status.replace('_', ' ')}
            </span>
          </div>
          <div style="font-weight: 600; color: #0F172A; margin-bottom: 4px;">
            ${report.hazard_type.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div style="color: #64748B; font-size: 0.75rem; margin-bottom: 8px;">
            📍 ${report.location_name}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; border-top: 1px solid #E2E8F0; padding-top: 6px;">
            <span style="color: #475569;">Priority: <strong style="color: #D97706;">${report.priority_level.toUpperCase()} (${report.priority_score})</strong></span>
            ${isDemo ? '<span style="font-size: 0.625rem; background: #F1F5F9; color: #64748B; padding: 1px 4px; border-radius: 3px;">DEMO</span>' : ''}
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

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #1F2937'
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 400,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '0.75rem',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 700, color: '#94A3B8' }}>Hazard Priority Levels</span>
          <span style={{ fontSize: '0.625rem', color: '#38BDF8', backgroundColor: '#1E293B', padding: '1px 5px', borderRadius: '3px' }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <span>Critical (85–100)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F97316' }} />
          <span>High (65–84)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <span>Medium (40–64)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>Low (0–39)</span>
        </div>
      </div>
    </div>
  );
};
