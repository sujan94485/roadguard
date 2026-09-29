import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Check, Radio } from 'lucide-react';
import { OPENSTREETMAP_PROVIDER, DEFAULT_MAP_CENTER } from '../../services/mapConfig';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  locationName: _locationName,
  onChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoSuccess, setGeoSuccess] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = latitude || DEFAULT_MAP_CENTER[0];
    const initialLng = longitude || DEFAULT_MAP_CENTER[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // Reliable OpenStreetMap tiles
    L.tileLayer(OPENSTREETMAP_PROVIDER.url, {
      attribution: OPENSTREETMAP_PROVIDER.attribution,
      maxZoom: OPENSTREETMAP_PROVIDER.maxZoom,
      subdomains: OPENSTREETMAP_PROVIDER.subdomains
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: '/markers/marker-critical.svg',
      iconSize: [32, 42],
      iconAnchor: [16, 42]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: markerIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setIsLocating(false);
        setGeoSuccess(true);
        setTimeout(() => setGeoSuccess(false), 2500);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }

        onChange(lat, lng, 'Current Detected Location');
      },
      error => {
        console.warn('Geolocation failed or permission denied:', error.message);
        setIsLocating(false);
        alert('Could not acquire GPS automatically. You can click anywhere on the map to set the hazard pin.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Header bar with Spatial Position Label & GPS Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <MapPin size={15} color="#38BDF8" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E2E8F0' }}>PIN HAZARD LOCATION</span>
          </label>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.625rem',
              color: '#94A3B8',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            SPATIAL POSITION
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '0.75rem',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: geoSuccess ? '#10B981' : 'rgba(56, 189, 248, 0.3)'
          }}
        >
          {geoSuccess ? (
            <>
              <Check size={13} color="#10B981" />
              <span style={{ color: '#6EE7B7' }}>GPS Coordinate Locked</span>
            </>
          ) : (
            <>
              <Crosshair size={13} color="#38BDF8" />
              <span>{isLocating ? 'Acquiring Satellites...' : 'Acquire My GPS'}</span>
            </>
          )}
        </button>
      </div>

      {/* Spatial Operations Map Container */}
      <div className="spatial-map-container">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Telemetry Coordinates Badge */}
        <div className="spatial-telemetry-badge">
          <Radio size={12} color="#38BDF8" />
          <span>
            PINNED INCIDENT: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </span>
        </div>
      </div>
    </div>
  );
};
