'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/navbar';

// Dynamically import Map component with SSR disabled
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span>Loading map...</span>
      </div>
    </div>
  ),
});

// iOS detection
function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Calculate distance between two points in miles
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Smart directions button
function SmartDirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const [isApple, setIsApple] = useState(false);
  
  useEffect(() => {
    setIsApple(isIOS());
  }, []);
  
  const url = isApple 
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded font-semibold transition-colors"
    >
      {isApple ? '🍎 Get Directions' : '🗺️ Get Directions'}
    </a>
  );
}

// Zip code directions button
function ZipDirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const [isApple, setIsApple] = useState(false);
  
  useEffect(() => {
    setIsApple(isIOS());
  }, []);
  
  const url = isApple 
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-1.5 px-3 text-sm text-center rounded font-medium transition-colors bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
    >
      {isApple ? '🍎 Directions' : '🗺️ Directions'}
    </a>
  );
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

export default function ComcastMapPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([47.2529, -122.4443]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestZip, setClosestZip] = useState<{ zip: string; city: string; distance: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisits();
    requestLocation();
  }, []);

  // Calculate closest ZIP when location updates
  useEffect(() => {
    if (!userLocation) return;
    
    let closest = territories[0];
    let minDistance = calculateDistance(userLocation.lat, userLocation.lng, closest.lat, closest.lng);
    
    for (const territory of territories) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, territory.lat, territory.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closest = territory;
      }
    }
    
    setClosestZip({
      zip: closest.zip,
      city: closest.city,
      distance: Math.round(minDistance * 10) / 10
    });
  }, [userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoError(null);
      },
      (error) => {
        console.log('Geolocation error:', error);
        setGeoError('Location access denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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

  const centerOnUser = () => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
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
          
          {/* Location Status Card */}
          <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📍</span>
              <span className="font-semibold text-sm">Your Location</span>
            </div>
            
            {userLocation ? (
              <div className="space-y-2">
                <div className="text-xs text-muted">
                  Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                </div>
                
                {closestZip && (
                  <div className={`p-2 rounded ${closestZip.distance < 3 ? 'bg-green-500/20 border border-green-500/50' : 'bg-yellow-500/20 border border-yellow-500/50'}`}>
                    <div className="text-sm font-semibold">
                      {closestZip.distance < 3 ? '✅ In Territory' : '⚠️ Outside Territory'}
                    </div>
                    <div className="text-xs mt-1">
                      Closest: <strong>{closestZip.zip}</strong> ({closestZip.city})
                    </div>
                    <div className="text-xs text-muted">
                      {closestZip.distance} miles away
                    </div>
                  </div>
                )}
                
                <button
                  onClick={centerOnUser}
                  className="w-full py-2 bg-accent text-accent-foreground rounded text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Center Map on Me
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted">
                  {geoError || 'Location not available'}
                </div>
                <button
                  onClick={requestLocation}
                  className="w-full py-2 bg-accent text-accent-foreground rounded text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Enable Location
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <div className="text-2xl font-bold">{visits.length}</div>
            <div className="text-sm text-muted">Total Visits</div>
          </div>
          
          <h3 className="font-semibold mb-3">Your 14 ZIP Codes</h3>
          <div className="space-y-3">
            {territories.map(t => {
              const count = visits.filter(v => v.zip === t.zip).length;
              const isClosest = closestZip?.zip === t.zip;
              
              return (
                <div key={t.zip} className={`space-y-2 p-2 rounded-lg transition-colors ${
                  isClosest ? 'bg-accent/20 border border-accent' : ''
                } ${selectedZip === t.zip ? 'bg-accent/10' : ''}`}>
                  <button
                    onClick={() => handleZipClick(t.zip)}
                    className={`w-full flex justify-between items-center p-2 rounded border transition-colors ${
                      selectedZip === t.zip 
                        ? 'bg-accent/20 border-accent' 
                        : 'bg-hover border-border hover:border-accent/50'
                    } ${isClosest ? 'ring-2 ring-accent' : ''}`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {t.zip}
                        {isClosest && <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">CLOSEST</span>}
                      </div>
                      <div className="text-xs text-muted">{t.city}</div>
                    </div>
                    <div className="bg-background text-muted text-sm px-2 py-1 rounded-full">
                      {count}
                    </div>
                  </button>
                  <ZipDirectionsButton lat={t.lat} lng={t.lng} />
                </div>
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
              Loading visits...
            </div>
          ) : (
            <MapComponent 
              visits={filteredVisits} 
              center={center}
              userLocation={userLocation}
              onLocationUpdate={setUserLocation}
            />
          )}
        </div>
      </div>
      
      {/* Add pulse animation for user location */}
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1); }
          100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3); }
        }
      `}</style>
    </>
  );
}
