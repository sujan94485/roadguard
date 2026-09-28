/**
 * Modular Map Configuration
 * Provides reliable, open-source tile layer configuration for Leaflet.
 * Can be swapped with any custom tile provider or self-hosted server without modifying UI components.
 */

export interface MapTileProvider {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string | string[];
}

export const OPENSTREETMAP_PROVIDER: MapTileProvider = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  maxZoom: 19,
  subdomains: ['a', 'b', 'c']
};

// Default demonstration geographic center: Mysuru / South Karnataka corridor
export const DEFAULT_MAP_CENTER: [number, number] = [12.3051, 76.6551];
export const DEFAULT_MAP_ZOOM = 13;
