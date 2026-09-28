import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Check } from 'lucide-react';
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
  locationName,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={16} color="#38BDF8" />
          <span>Pin Hazard Location on Map</span>
        </label>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {geoSuccess ? (
            <>
              <Check size={13} color="#10B981" />
              <span>Location Locked</span>
            </>
          ) : (
            <>
              <Crosshair size={13} />
              <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
            </>
          )}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          height: '240px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #374151',
          position: 'relative'
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            zIndex: 400,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.6875rem',
            color: '#CBD5E1'
          }}
        >
          Click map or drag pin ({latitude.toFixed(4)}, {longitude.toFixed(4)})
        </div>
      </div>
    </div>
  );
};
