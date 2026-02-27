'use client';

import { useEffect, useState, useRef } from 'react';
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
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function SmartDirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const [isApple, setIsApple] = useState(false);
  useEffect(() => setIsApple(isIOS()), []);
  const url = isApple 
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white text-center rounded font-semibold transition-colors">
      {isApple ? '🍎 Get Directions' : '🗺️ Get Directions'}
    </a>
  );
}

function ZipDirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const [isApple, setIsApple] = useState(false);
  useEffect(() => setIsApple(isIOS()), []);
  const url = isApple 
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block w-full py-1.5 px-3 text-sm text-center rounded font-medium transition-colors bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
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

export default function ComcastMapPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([47.2529, -122.4443]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestZip, setClosestZip] = useState<{ zip: string; city: string; distance: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisit, setNewVisit] = useState({ businessName: '', contactName: '', phone: '', address: '', zip: '', status: 'interested', notes: '' });

  useEffect(() => {
    fetchVisits();
    requestLocation();
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    let closest = territories[0];
    let minDistance = calculateDistance(userLocation.lat, userLocation.lng, closest.lat, closest.lng);
    for (const t of territories) {
      const d = calculateDistance(userLocation.lat, userLocation.lng, t.lat, t.lng);
      if (d < minDistance) { minDistance = d; closest = t; }
    }
    setClosestZip({ zip: closest.zip, city: closest.city, distance: Math.round(minDistance * 10) / 10 });
  }, [userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoError(null); },
      () => setGeoError('Location access denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setVisits(data.visits || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleZipClick = (zip: string) => {
    const t = territories.find(x => x.zip === zip);
    if (t) { setCenter([t.lat, t.lng]); setSelectedZip(zip); }
  };

  const centerOnUser = () => { if (userLocation) setCenter([userLocation.lat, userLocation.lng]); };
  const filteredVisits = selectedZip ? visits.filter(v => v.zip === selectedZip) : visits;

  const handleMapClick = (lat: number, lng: number) => {
    if (!addMode) return;
    setTempPin({ lat, lng });
    setShowAddModal(true);
    setAddMode(false);
  };

  const handleAddVisit = async () => {
    if (!tempPin) return;
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newVisit, lat: tempPin.lat, lng: tempPin.lng }),
      });
      if (res.ok) {
        await fetchVisits();
        setShowAddModal(false);
        setTempPin(null);
        setNewVisit({ businessName: '', contactName: '', phone: '', address: '', zip: '', status: 'interested', notes: '' });
      }
    } catch (err) { console.error(err); }
  };

  // Desktop Sidebar Content
  const SidebarContent = () => (
    <>
      <h1 className="text-xl font-bold mb-2">🏢 Comcast Territory</h1>
      <p className="text-sm text-muted mb-4">Senior Business Account Executive</p>
      
      {/* Location Card */}
      <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <span className="font-semibold text-sm">Your Location</span>
        </div>
        {userLocation ? (
          <div className="space-y-2">
            {closestZip && (
              <div className={`p-2 rounded ${closestZip.distance < 3 ? 'bg-green-500/20 border border-green-500/50' : 'bg-yellow-500/20 border border-yellow-500/50'}`}>
                <div className="text-sm font-semibold">{closestZip.distance < 3 ? '✅ In Territory' : '⚠️ Outside Territory'}</div>
                <div className="text-xs mt-1">Closest: <strong>{closestZip.zip}</strong> ({closestZip.city}) • {closestZip.distance}mi</div>
              </div>
            )}
            <button onClick={centerOnUser} className="w-full py-2 bg-accent text-accent-foreground rounded text-sm font-medium">Center Map on Me</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-muted">{geoError || 'Location not available'}</div>
            <button onClick={requestLocation} className="w-full py-2 bg-accent text-accent-foreground rounded text-sm font-medium">Enable Location</button>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="mb-4 flex items-center gap-4">
        <div>
          <div className="text-2xl font-bold">{visits.length}</div>
          <div className="text-sm text-muted">Visits</div>
        </div>
        {closestZip && (
          <div className="text-sm">
            <span className="text-muted">Closest:</span> <strong>{closestZip.zip}</strong>
          </div>
        )}
      </div>
      
      {/* ZIP Codes */}
      <h3 className="font-semibold mb-3">14 ZIP Codes</h3>
      <div className="space-y-2">
        {territories.map(t => {
          const count = visits.filter(v => v.zip === t.zip).length;
          const isClosest = closestZip?.zip === t.zip;
          return (
            <div key={t.zip} className={`p-2 rounded-lg ${isClosest ? 'bg-accent/20 border border-accent' : ''} ${selectedZip === t.zip ? 'bg-accent/10' : ''}`}>
              <button onClick={() => handleZipClick(t.zip)} className={`w-full flex justify-between items-center p-2 rounded border transition-colors ${selectedZip === t.zip ? 'bg-accent/20 border-accent' : 'bg-hover border-border hover:border-accent/50'} ${isClosest ? 'ring-2 ring-accent' : ''}`}>
                <div>
                  <div className="font-semibold flex items-center gap-2">{t.zip} {isClosest && <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">NEAR</span>}</div>
                  <div className="text-xs text-muted">{t.city}</div>
                </div>
                <div className="bg-background text-muted text-sm px-2 py-1 rounded-full">{count}</div>
              </button>
              <div className="mt-1"><ZipDirectionsButton lat={t.lat} lng={t.lng} /></div>
            </div>
          );
        })}
      </div>
      
      {selectedZip && (
        <button onClick={() => setSelectedZip(null)} className="w-full mt-4 py-2 text-sm text-accent hover:underline">Show all visits</button>
      )}
      
      {/* Add Pin Button */}
      <button
        onClick={() => setAddMode(true)}
        className={`w-full mt-6 py-3 rounded-lg font-semibold transition-colors ${addMode ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
      >
        {addMode ? '📍 Tap map to place pin' : '➕ Add New Visit'}
      </button>
      {addMode && (
        <button onClick={() => setAddMode(false)} className="w-full mt-2 py-2 text-sm text-muted hover:text-foreground">
          Cancel
        </button>
      )}
    </>
  );

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-card border-r border-border overflow-y-auto p-4">
          <SidebarContent />
        </div>
        
        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted">Loading visits...</div>
          ) : (
            <MapComponent visits={filteredVisits} center={center} userLocation={userLocation} onLocationUpdate={setUserLocation} onMapClick={handleMapClick} addMode={addMode} tempPin={tempPin} />
          )}
        </div>
        
        {/* Mobile Bottom Sheet Drawer */}
        {isMobile && (
          <>
            {/* Backdrop */}
            {drawerOpen && (
              <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={() => setDrawerOpen(false)} />
            )}
            
            {/* Drawer */}
            <div className={`fixed left-0 right-0 bg-card border-t border-border z-[9999] transition-transform duration-300 ease-out ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'} bottom-0 rounded-t-2xl shadow-2xl max-h-[70vh]`}>
              {/* Handle Bar - Always Visible */}
              <div 
                className="flex flex-col items-center pt-3 pb-2 cursor-pointer"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mb-3" />
                
                {/* Peek Content */}
                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏢</span>
                    <div>
                      <span className="font-semibold">Comcast Territory</span>
                      <span className="text-muted text-sm ml-2">{visits.length} visits</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {closestZip && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        Near {closestZip.zip}
                      </span>
                    )}
                    <span className="text-muted text-lg">{drawerOpen ? '▼' : '▲'}</span>
                  </div>
                </div>
              </div>
              
              {/* Expanded Content */}
              <div className={`overflow-y-auto px-4 pb-6 transition-all ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} style={{ maxHeight: 'calc(70vh - 80px)' }}>
                <SidebarContent />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Add Visit Modal */}
      {showAddModal && tempPin && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">📍 Add New Visit</h2>
            <p className="text-sm text-muted mb-4">Location: {tempPin.lat.toFixed(5)}, {tempPin.lng.toFixed(5)}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Name *</label>
                <input type="text" value={newVisit.businessName} onChange={e => setNewVisit({...newVisit, businessName: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="Joe's Plumbing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input type="text" value={newVisit.contactName} onChange={e => setNewVisit({...newVisit, contactName: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" value={newVisit.phone} onChange={e => setNewVisit({...newVisit, phone: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="253-555-0123" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input type="text" value={newVisit.address} onChange={e => setNewVisit({...newVisit, address: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="123 Main St" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP</label>
                <input type="text" value={newVisit.zip} onChange={e => setNewVisit({...newVisit, zip: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="98407" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={newVisit.status} onChange={e => setNewVisit({...newVisit, status: e.target.value})} className="w-full p-2 rounded border bg-background">
                  <option value="interested">Interested</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="called">Called</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={newVisit.notes} onChange={e => setNewVisit({...newVisit, notes: e.target.value})} className="w-full p-2 rounded border bg-background" rows={3} placeholder="Any notes..." />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setTempPin(null); }} className="flex-1 py-2 rounded border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAddVisit} disabled={!newVisit.businessName} className="flex-1 py-2 rounded bg-accent text-accent-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors">Save Visit</button>
            </div>
          </div>
        </div>
      )}

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
