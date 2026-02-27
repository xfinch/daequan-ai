'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (client-side only)
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
}

interface Visit {
  _id: string;
  businessName: string;
  contactName?: string;
  phone?: string;
  address?: string;
  zip?: string;
  city?: string;
  status: string;
  notes?: string;
  ghlUrl?: string;
  needsUpdate?: boolean;
  missingFields?: string[];
  lat?: number;
  lng?: number;
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  'interested': '#22c55e',
  'follow-up': '#f59e0b',
  'not-interested': '#ef4444',
  'called': '#3b82f6',
  'customer': '#8b5cf6',
};

const territories = [
  { zip: '98070', city: 'Vashon', lat: 47.4474, lng: -122.4598 },
  { zip: '98321', city: 'Buckley', lat: 47.1611, lng: -122.0296 },
  { zip: '98323', city: 'Carbonado', lat: 47.0812, lng: -122.0519 },
  { zip: '98385', city: 'South Prairie', lat: 47.1372, lng: -122.0953 },
  { zip: '98391', city: 'Lake Tapps', lat: 47.1983, lng: -122.1731 },
  { zip: '98396', city: 'Wilkeson', lat: 47.1069, lng: -122.0456 },
  { zip: '98403', city: 'Tacoma', lat: 47.2626, lng: -122.4483 },
  { zip: '98404', city: 'Tacoma', lat: 47.2151, lng: -122.4123 },
  { zip: '98406', city: 'Tacoma', lat: 47.2646, lng: -122.5149 },
  { zip: '98407', city: 'Ruston', lat: 47.2994, lng: -122.5155 },
  { zip: '98413', city: 'Tacoma', lat: 47.2529, lng: -122.4443 },
  { zip: '98416', city: 'Tacoma', lat: 47.2618, lng: -122.4807 },
  { zip: '98443', city: 'Tacoma', lat: 47.2025, lng: -122.3649 },
  { zip: '98447', city: 'Tacoma (Midland)', lat: 47.1650, lng: -122.4150 },
];

// iOS detection
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

interface MapProps {
  visits: Visit[];
  center: [number, number];
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate: (loc: { lat: number; lng: number }) => void;
  onMapClick?: (lat: number, lng: number) => void;
  addMode?: boolean;
  tempPin?: { lat: number; lng: number } | null;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function MapClickHandler({ onClick, addMode }: { onClick?: (lat: number, lng: number) => void; addMode?: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!onClick || !addMode) return;
    const handler = (e: L.LeafletMouseEvent) => onClick(e.latlng.lat, e.latlng.lng);
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onClick, addMode]);
  return null;
}

export default function MapComponent({ visits, center, userLocation, onLocationUpdate, onMapClick, addMode, tempPin }: MapProps) {
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    setIsApple(isIOS());
  }, []);

  // Location is watched by parent component to avoid re-renders

  const getDirectionsUrl = (lat: number, lng: number) => {
    if (isApple) {
      return `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={center} />
      <MapClickHandler onClick={onMapClick} addMode={addMode} />
      
      {/* User location marker */}
      {userLocation && (
        <>
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `<div style="
                width: 16px;
                height: 16px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div className="text-sm font-semibold">Your Location</div>
            </Popup>
          </Marker>
          <Circle 
            center={[userLocation.lat, userLocation.lng]}
            radius={100}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
          />
        </>
      )}
      
      {/* Temp pin marker */}
      {tempPin && (
        <Marker 
          position={[tempPin.lat, tempPin.lng]}
          icon={L.divIcon({
            className: 'temp-pin',
            html: `<div style="
              width: 24px;
              height: 24px;
              background: #f59e0b;
              border: 3px solid white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 24]
          })}
        />
      )}
      
      {/* Visit markers */}
      {visits.map((visit) => {
        if (!visit.lat || !visit.lng) return null;
        
        const color = statusColors[visit.status] || '#666';
        const needsUpdate = visit.needsUpdate || (visit.missingFields && visit.missingFields.length > 0);
        
        return (
          <Marker
            key={visit._id}
            position={[visit.lat, visit.lng]}
            icon={L.divIcon({
              className: 'custom-pin',
              html: `<div style="
                width: 20px;
                height: 20px;
                background: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="min-w-[280px]">
                <h4 className="font-semibold text-lg mb-2">{visit.businessName}</h4>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase`}
                    style={{ 
                      background: color + '20', 
                      color: color 
                    }}>
                    {visit.status}
                  </span>
                  {needsUpdate && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                      ⚠️ Needs Update
                    </span>
                  )}
                </div>
                
                {visit.contactName && (
                  <div className="mb-2 text-sm">
                    <span className="text-gray-500 text-xs uppercase">Contact</span>
                    <div>{visit.contactName}</div>
                  </div>
                )}
                
                {visit.phone && (
                  <div className="mb-2 text-sm">
                    <span className="text-gray-500 text-xs uppercase">Phone</span>
                    <div>{visit.phone}</div>
                  </div>
                )}
                
                <div className="mb-3 text-sm">
                  <span className="text-gray-500 text-xs uppercase">Address</span>
                  <div>{visit.address}, {visit.zip}</div>
                </div>
                
                <a
                  href={getDirectionsUrl(visit.lat, visit.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded font-semibold transition-colors"
                >
                  Directions
                </a>
                
                {visit.notes && (
                  <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                    <div className="text-xs text-gray-500 mb-1">
                      📝 {visit.createdAt ? new Date(visit.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                    {visit.notes}
                  </div>
                )}
                
                {visit.missingFields && visit.missingFields.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>⚠️ Missing:</strong> {visit.missingFields.join(', ')}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
