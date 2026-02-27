'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/ui/navbar';

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

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function ZipDirectionsButton({ lat, lng }: { lat: number; lng: number }) {
  const url = isIOS()
    ? `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block w-full py-1.5 px-3 text-sm text-center rounded font-medium transition-colors bg-blue-500/20 hover:bg-blue-500/30 text-blue-400">
      Directions
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
  createdAt?: string;
}

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

// Manual Entry Component - separate to prevent re-renders
function ManualEntry({ onGeocode }: { onGeocode: (address: string) => void }) {
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const handleSubmit = async () => {
    if (!address) return;
    setGeocoding(true);
    await onGeocode(address);
    setGeocoding(false);
    setAddress('');
  };

  return (
    <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
      <h4 className="font-semibold mb-3">Manual Entry</h4>
      <p className="text-xs text-muted mb-3">Enter address to geocode</p>
      <div className="space-y-3">
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full p-2 rounded border bg-background text-sm"
          placeholder="123 Main St, Tacoma, WA"
        />
        <button
          onClick={handleSubmit}
          disabled={!address || geocoding}
          className="w-full py-2 bg-secondary text-secondary-foreground rounded text-sm font-medium disabled:opacity-50"
        >
          {geocoding ? 'Geocoding...' : 'Find & Add Pin'}
        </button>
      </div>
    </div>
  );
}

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVisit, setNewVisit] = useState({ businessName: '', contactName: '', phone: '', address: '', zip: '', status: 'interested', notes: '' });

  useEffect(() => {
    fetchVisits();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGeoError('Location denied'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    let closest = territories[0];
    let minDist = Infinity;
    for (const t of territories) {
      const d = Math.sqrt(Math.pow(userLocation.lat - t.lat, 2) + Math.pow(userLocation.lng - t.lng, 2));
      if (d < minDist) { minDist = d; closest = t; }
    }
    setClosestZip({ zip: closest.zip, city: closest.city, distance: Math.round(minDist * 69 * 10) / 10 });
  }, [userLocation]);

  const fetchVisits = async () => {
    try {
      const res = await fetch('/api/visits');
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleManualGeocode = useCallback(async (address: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data?.[0]) {
        const { lat, lon, display_name } = data[0];
        setNewVisit(prev => ({ ...prev, address: display_name }));
        setShowAddModal(true);
      } else {
        alert('Address not found');
      }
    } catch (e) {
      alert('Geocoding failed');
    }
  }, []);

  const handleSaveVisit = async () => {
    try {
      await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisit),
      });
      setShowAddModal(false);
      setNewVisit({ businessName: '', contactName: '', phone: '', address: '', zip: '', status: 'interested', notes: '' });
      fetchVisits();
    } catch (e) { console.error(e); }
  };

  const filteredVisits = selectedZip ? visits.filter(v => v.zip === selectedZip) : visits;

  // Memoized sidebar content to prevent re-renders
  const SidebarContent = useMemo(() => (
    <>
      <h1 className="text-xl font-bold mb-2">Comcast Territory</h1>
      <p className="text-sm text-muted mb-4">{visits.length} visits</p>
      
      {closestZip && (
        <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="text-sm font-semibold">Closest: {closestZip.zip} ({closestZip.city})</div>
          <div className="text-xs text-muted">{closestZip.distance} miles away</div>
        </div>
      )}
      
      <h3 className="font-semibold mb-3">ZIP Codes</h3>
      <div className="space-y-2">
        {territories.map(t => {
          const count = visits.filter(v => v.zip === t.zip).length;
          const isClosest = closestZip?.zip === t.zip;
          return (
            <div key={t.zip} className={`p-2 rounded-lg ${isClosest ? 'bg-accent/20' : ''}`}>
              <button onClick={() => setSelectedZip(t.zip)} className="w-full flex justify-between items-center p-2 rounded border">
                <div>
                  <div className="font-semibold">{t.zip} {isClosest && <span className="text-xs bg-accent px-1 rounded">NEAR</span>}</div>
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
        <button onClick={() => setSelectedZip(null)} className="w-full mt-4 py-2 text-sm text-accent">Show all</button>
      )}
      
      <ManualEntry onGeocode={handleManualGeocode} />
    </>
  ), [visits, closestZip, selectedZip, handleManualGeocode]);

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-card border-r border-border overflow-y-auto p-4">
          {SidebarContent}
        </div>
        
        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted">Loading...</div>
          ) : (
            <MapComponent visits={filteredVisits} center={center} />
          )}
        </div>
        
        {/* Mobile Drawer */}
        {isMobile && (
          <>
            {drawerOpen && (
              <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={() => setDrawerOpen(false)} />
            )}
            <div className={`fixed left-0 right-0 bg-card border-t border-border z-[9999] transition-transform ${drawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'} bottom-0 rounded-t-2xl shadow-2xl max-h-[70vh]`}>
              <div className="flex flex-col items-center pt-3 pb-2 cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)}>
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mb-3" />
                <div className="flex items-center justify-between w-full px-4">
                  <span className="font-semibold">Comcast Territory • {visits.length} visits</span>
                  <span className="text-muted">{drawerOpen ? '▼' : '▲'}</span>
                </div>
              </div>
              <div className={`overflow-y-auto px-4 pb-6 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} style={{ maxHeight: 'calc(70vh - 60px)' }}>
                {SidebarContent}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">Add Visit</h2>
            <div className="space-y-3">
              <input type="text" value={newVisit.businessName} onChange={e => setNewVisit({...newVisit, businessName: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="Business Name *" />
              <input type="text" value={newVisit.contactName} onChange={e => setNewVisit({...newVisit, contactName: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="Contact" />
              <input type="text" value={newVisit.phone} onChange={e => setNewVisit({...newVisit, phone: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="Phone" />
              <input type="text" value={newVisit.address} onChange={e => setNewVisit({...newVisit, address: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="Address" />
              <input type="text" value={newVisit.zip} onChange={e => setNewVisit({...newVisit, zip: e.target.value})} className="w-full p-2 rounded border bg-background" placeholder="ZIP" />
              <select value={newVisit.status} onChange={e => setNewVisit({...newVisit, status: e.target.value})} className="w-full p-2 rounded border bg-background">
                <option value="interested">Interested</option>
                <option value="follow-up">Follow-up</option>
                <option value="not-interested">Not Interested</option>
                <option value="called">Called</option>
                <option value="customer">Customer</option>
              </select>
              <textarea value={newVisit.notes} onChange={e => setNewVisit({...newVisit, notes: e.target.value})} className="w-full p-2 rounded border bg-background" rows={3} placeholder="Notes" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded border">Cancel</button>
              <button onClick={handleSaveVisit} disabled={!newVisit.businessName} className="flex-1 py-2 rounded bg-accent text-accent-foreground font-semibold disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
