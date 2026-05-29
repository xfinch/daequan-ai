import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';

// GET /api/visits?date=2026-05-19
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let query: any = {};
    
    if (date) {
      // Filter by date if provided
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const visits = await Visit.find(query).sort({ createdAt: -1 }).lean();
    
    // Transform _id to string for JSON serialization
    const transformedVisits = visits.map(v => ({
      ...v,
      _id: v._id.toString(),
    }));
    
    return NextResponse.json({ visits: transformedVisits });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

// POST /api/visits
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      businessName,
      contactName,
      phone,
      email,
      address,
      city,
      zip,
      status,
      notes,
      lat,
      lng
    } = body;

    const visit = await Visit.create({
      businessName,
      contactName,
      phone,
      email,
      address,
      city: city || 'Tacoma',
      state: 'WA',
      zip,
      status: status || 'interested',
      notes,
      lat,
      lng
    });
    
    return NextResponse.json({ 
      success: true, 
      id: visit._id.toString()
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}
