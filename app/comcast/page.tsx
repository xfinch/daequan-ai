'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '@/components/ui/navbar';

interface Visit {
  _id: string;
  businessName: string;
  contactName?: string;
  phone?: string;
  address?: string;
  zip?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  status: string;
  notes?: string;
  ghlUrl?: string;
  ghlContactId?: string;
  needsUpdate?: boolean;
  missingFields?: string[];
  createdAt: string;
}

interface Territory {
  zip: string;
  city: string;
  lat: number;
  lng: number;
}

const territories: Territory[] = [
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

const statusColors: Record<string, string> = {
  'interested': '#22c55e',
  'follow-up': '#f59e0b',
  'not-interested': '#ef4444',
  'called': '#3b82f6',
  'customer': '#8b5cf6',
};

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function ComcastMapPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([47.2529, -122.4443]);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (err) {
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleZipClick = (zip: string) => {
    const territory = territories.find(t => t.zip === zip);
    if (territory) {
      setCenter([territory.lat, territory.lng]);
      setSelectedZip(zip);
    }
  };

  const filteredVisits = selectedZip 
    ? visits.filter(v => v.zip === selectedZip)
    : visits;

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border overflow-y-auto p-4">
          <h1 className="text-xl font-bold mb-2">🏢 Comcast Territory</h1>
          <p className="text-sm text-muted mb-4">Senior Business Account Executive</p>
          
          <div className="mb-4">
            <div className="text-2xl font-bold">{visits.length}</div>
            <div className="text-sm text-muted">Total Visits</div>
          </div>
          
          <h3 className="font-semibold mb-3">Zip Codes</h3>
          <div className="space-y-2">
            {territories.map(t => {
              const count = visits.filter(v => v.zip === t.zip).length;
              return (
                <button
                  key={t.zip}
                  onClick={() => handleZipClick(t.zip)}
                  className={`w-full flex justify-between items-center p-3 rounded-lg border transition-colors ${
                    selectedZip === t.zip 
                      ? 'bg-accent/20 border-accent' 
                      : 'bg-hover border-border hover:border-accent/50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{t.zip}</div>
                    <div className="text-xs text-muted">{t.city}</div>
                  </div>
                  <div className="bg-background text-muted text-sm px-2 py-1 rounded-full">
                    {count}
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedZip && (
            <button
              onClick={() => setSelectedZip(null)}
              className="w-full mt-4 py-2 text-sm text-accent hover:underline"
            >
              Show all visits
            </button>
          )}
        </div>
        
        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted">
              Loading map...
            </div>
          ) : (
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
              
              {/* Territory labels */}
              {territories.map(t => (
                <Marker
                  key={t.zip}
                  position={[t.lat, t.lng]}
                  icon={L.divIcon({
                    className: 'territory-label',
                    html: `<div style="
                      background: rgba(0,87,184,0.9); 
                      color: white; 
                      padding: 4px 10px; 
                      border-radius: 12px; 
                      font-size: 13px; 
                      font-weight: bold; 
                      border: 2px solid white; 
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    ">${t.zip}</div>`,
                    iconSize: [60, 30],
                    iconAnchor: [30, 15],
                  })}
                />
              ))}
              
              {/* Territory circles */}
              {territories.map(t => (
                <Circle
                  key={`circle-${t.zip}`}
                  center={[t.lat, t.lng]}
                  radius={2000}
                  pathOptions={{
                    color: '#0057b8',
                    fillColor: '#0057b8',
                    fillOpacity: 0.05,
                    weight: 1,
                  }}
                />
              ))}
              
              {/* Visit markers */}
              {filteredVisits.map(visit => {
                if (!visit.lat || !visit.lng) return null;
                const color = statusColors[visit.status] || '#666';
                
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
                      iconAnchor: [10, 10],
                    })}
                  >
                    <Popup>
                      <div className="min-w-[250px]">
                        <h3 className="font-bold text-lg mb-1">{visit.businessName}</h3>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          visit.status === 'interested' ? 'bg-green-100 text-green-800' :
                          visit.status === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                          visit.status === 'not-interested' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {visit.status}
                        </span>
                        
                        {visit.needsUpdate && (
                          <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                            ⚠️ Needs Update
                          </span>
                        )}
                        
                        {visit.ghlUrl && (
                          <a 
                            href={visit.ghlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-3 py-2 px-4 bg-red-600 text-white text-center rounded font-semibold hover:bg-red-700"
                          >
                            ✏️ Edit in GHL
                          </a>
                        )}
                        
                        {visit.contactName && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 uppercase">Contact</div>
                            <div>{visit.contactName}</div>
                          </div>
                        )}
                        
                        {visit.phone && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 uppercase">Phone</div>
                            <div>{visit.phone}</div>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 uppercase">Address</div>
                          <div>{visit.address}, {visit.zip}</div>
                        </div>
                        
                        {/* 🗺️ MAPS DEEP LINKS */}
                        <div className="mt-3 space-y-2">
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${visit.lat},${visit.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 px-4 bg-blue-500 text-white text-center rounded font-semibold hover:bg-blue-600"
                          >
                            🗺️ Open in Google Maps
                          </a>
                          <a 
                            href={`http://maps.apple.com/?daddr=${visit.lat},${visit.lng}&dirflg=d`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2 px-4 bg-slate-700 text-white text-center rounded font-semibold hover:bg-slate-800"
                          >
                            🍎 Open in Apple Maps
                          </a>
                        </div>
                        
                        {visit.notes && (
                          <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
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
          )}
        </div>
      </div>
    </>
  );
}
