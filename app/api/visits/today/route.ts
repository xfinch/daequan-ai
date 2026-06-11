import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get today's date in Pacific timezone (America/Los_Angeles)
    const now = new Date();
    const pacificDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = pacificDate.split('/');
    const todayStr = `${year}-${month}-${day}`;
    
    // Create start and end of today in Pacific time
    const startOfDay = new Date(`${todayStr}T00:00:00-07:00`);
    const endOfDay = new Date(`${todayStr}T23:59:59-07:00`);
    
    // Query MongoDB for today's visits
    const visits = await Visit.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ createdAt: -1 }).lean();
    
    // Transform to response format
    const leads = visits.map(v => ({
      business_name: v.businessName || '',
      contact_name: v.contactName || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      city: v.city || '',
      zip_code: v.zip || '',
      visit_status: v.status || '',
      visit_date: v.createdAt ? new Date(v.createdAt).toISOString() : '',
      notes: v.notes || '',
      visit_context: v.visitContext || ''
    }));
    
    return NextResponse.json({
      date: todayStr,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Error fetching today\'s leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s leads' },
      { status: 500 }
    );
  }
}
