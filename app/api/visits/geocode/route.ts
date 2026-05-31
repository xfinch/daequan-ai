import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';

// Rate limiting - Nominatim requires max 1 request per second
const DELAY_MS = 1100;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeAddress(address: string, city: string, zip: string): Promise<{ lat: number; lng: number } | null> {
  const fullAddress = `${address}, ${city || 'Tacoma'}, WA ${zip || ''}`.trim();
  
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DaequanAI-ComcastCRM/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (err) {
    console.error(`Geocoding error for "${fullAddress}":`, err);
    return null;
  }
}

// POST /api/visits/geocode - Geocode visits missing coordinates
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Find visits without coordinates but with addresses
    const visits = await Visit.find({
      $or: [
        { lat: null },
        { lng: null },
        { lat: { $exists: false } },
        { lng: { $exists: false } }
      ],
      $and: [
        { $or: [{ address: { $ne: null } }, { zip: { $ne: null } }] }
      ]
    }).limit(50); // Process in batches to avoid timeouts
    
    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[]
    };
    
    for (const visit of visits) {
      const businessName = visit.businessName || 'Unknown';
      
      if (!visit.address && !visit.zip) {
        results.skipped++;
        results.details.push({ businessName, status: 'skipped', reason: 'no address' });
        continue;
      }
      
      const coords = await geocodeAddress(visit.address || '', visit.city || 'Tacoma', visit.zip || '');
      
      if (coords) {
        await Visit.updateOne(
          { _id: visit._id },
          { $set: { lat: coords.lat, lng: coords.lng, updatedAt: new Date() } }
        );
        results.success++;
        results.details.push({ businessName, status: 'success', lat: coords.lat, lng: coords.lng });
      } else {
        results.failed++;
        results.details.push({ businessName, status: 'failed', address: visit.address });
      }
      
      results.processed++;
      
      // Rate limiting - wait between requests
      if (visits.indexOf(visit) < visits.length - 1) {
        await sleep(DELAY_MS);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      results,
      remaining: await Visit.countDocuments({
        $or: [
          { lat: null },
          { lng: null },
          { lat: { $exists: false } },
          { lng: { $exists: false } }
        ]
      })
    });
    
  } catch (error) {
    console.error('Error geocoding visits:', error);
    return NextResponse.json({ error: 'Failed to geocode visits' }, { status: 500 });
  }
}

// GET /api/visits/geocode - Get count of visits needing geocoding
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const totalVisits = await Visit.countDocuments();
    const withoutCoords = await Visit.countDocuments({
      $or: [
        { lat: null },
        { lng: null },
        { lat: { $exists: false } },
        { lng: { $exists: false } }
      ]
    });
    const withCoords = await Visit.countDocuments({
      lat: { $ne: null },
      lng: { $ne: null }
    });
    
    return NextResponse.json({
      total: totalVisits,
      withCoordinates: withCoords,
      withoutCoordinates: withoutCoords
    });
    
  } catch (error) {
    console.error('Error counting visits:', error);
    return NextResponse.json({ error: 'Failed to count visits' }, { status: 500 });
  }
}
