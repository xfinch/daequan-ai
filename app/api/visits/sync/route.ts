import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';
import sqlite3 from 'sqlite3';

// This endpoint syncs all visits from local SQLite to MongoDB
export async function POST(request: NextRequest) {
  // Simple auth check - in production use proper auth
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer xavier-sync-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Open SQLite database using sqlite3 directly
    const dbPath = '/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db';
    
    // Fetch all visits from SQLite using promise wrapper
    const visits: any[] = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) reject(err);
      });
      
      db.all(`
      SELECT 
        id,
        ghl_contact_id,
        business_name,
        contact_name,
        phone,
        email,
        address,
        city,
        state,
        zip_code,
        lat,
        lng,
        visit_status,
        visit_date,
        notes
      FROM business_visits
      ORDER BY visit_date DESC`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
      
      db.close();
    });

    // Connect to MongoDB
    await connectDB();

    const results = {
      added: 0,
      updated: 0,
      failed: 0,
      total: visits.length
    };

    // Sync each visit
    for (const visit of visits) {
      try {
        // Build query
        const query: any = { $or: [] };
        if (visit.ghl_contact_id) {
          query.$or.push({ ghlContactId: visit.ghl_contact_id });
        }
        query.$or.push({ 
          businessName: visit.business_name,
          zip: visit.zip_code
        });

        const existing = await Visit.findOne(query);

        const record = {
          sqliteId: visit.id,
          ghlContactId: visit.ghl_contact_id,
          businessName: visit.business_name,
          contactName: visit.contact_name,
          phone: visit.phone,
          email: visit.email,
          address: visit.address,
          city: visit.city || 'Tacoma',
          state: visit.state || 'WA',
          zip: visit.zip_code,
          lat: visit.lat,
          lng: visit.lng,
          status: visit.visit_status || 'interested',
          notes: visit.notes,
        };

        if (existing) {
          await Visit.updateOne({ _id: existing._id }, { $set: record });
          results.updated++;
        } else {
          await Visit.create(record);
          results.added++;
        }
      } catch (err) {
        console.error(`Failed to sync ${visit.business_name}:`, err);
        results.failed++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `Synced ${results.total} visits: ${results.added} added, ${results.updated} updated, ${results.failed} failed`
    });

  } catch (err) {
    console.error('Sync error:', err);
    return NextResponse.json({ 
      error: 'Failed to sync visits',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get sync status
export async function GET() {
  try {
    await connectDB();
    const count = await Visit.countDocuments();
    return NextResponse.json({ 
      mongoDbVisits: count,
      sqliteVisits: 53, // Known from CSV export
      synced: count >= 53
    });
  } catch (err) {
    return NextResponse.json({ 
      error: 'Failed to get status',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
