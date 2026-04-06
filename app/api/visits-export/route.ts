import { NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const visits = await Visit.find().sort({ createdAt: -1 }).lean();
    
    // Build CSV
    const headers = ['Business Name', 'Contact Name', 'Phone', 'Email', 'Address', 'City', 'State', 'ZIP', 'Status', 'Visit Date', 'Notes'];
    
    const rows = visits.map((v: any) => [
      v.businessName || '',
      v.contactName || '',
      v.phone || '',
      v.email || '',
      v.address || '',
      v.city || '',
      v.state || '',
      v.zip || '',
      v.status || '',
      v.createdAt ? new Date(v.createdAt).toISOString() : '',
      (v.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')
    ]);
    
    // Escape and format CSV
    const escapeCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val}"`;
      }
      return val;
    };
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="comcast-visits.csv"'
      }
    });
  } catch (err) {
    console.error('Error generating CSV:', err);
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 });
  }
}
