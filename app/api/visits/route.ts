import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const visits = await Visit.find().sort({ createdAt: -1 }).lean();
    
    // Add GHL URL to each visit
    const visitsWithGhl = visits.map(v => ({
      ...v,
      _id: v._id.toString(),
      ghlUrl: v.ghlContactId 
        ? `https://app.thetraffic.link/v2/location/mhvGjZGZPcsK3vgjEDwI/contacts/detail/${v.ghlContactId}`
        : null,
    }));
    
    return NextResponse.json({ visits: visitsWithGhl });
  } catch (err) {
    console.error('Error fetching visits:', err);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const visit = new Visit({
      businessName: body.businessName,
      contactName: body.contactName,
      phone: body.phone,
      email: body.email,
      address: body.address,
      city: body.city || 'Tacoma',
      state: body.state || 'WA',
      zip: body.zip,
      lat: body.lat,
      lng: body.lng,
      status: body.status || 'interested',
      notes: body.notes,
      missingFields: body.missingFields || [],
      needsUpdate: body.needsUpdate || false,
    });
    
    await visit.save();
    
    return NextResponse.json({ 
      success: true, 
      visit: { ...visit.toObject(), _id: visit._id.toString() }
    }, { status: 201 });
  } catch (err) {
    console.error('Error creating visit:', err);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}
