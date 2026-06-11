import { NextResponse } from 'next/server';

const GHL_TOKEN = process.env.GHL_COMCAST_TOKEN || '';
const GHL_LOCATION_ID = 'nPubo6INanVq94ovAQNW';

export async function GET() {
  try {
    if (!GHL_TOKEN) {
      return NextResponse.json({ error: 'GHL token not configured' }, { status: 500 });
    }

    // Fetch contacts from GHL
    const response = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_TOKEN}`,
          'Version': '2021-04-15'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GHL API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts = data.contacts || [];

    // Filter for today's contacts (or recent)
    const today = new Date().toISOString().split('T')[0];
    const recentContacts = contacts.filter((c: any) => {
      const addedDate = c.dateAdded ? c.dateAdded.split('T')[0] : '';
      return addedDate === today || addedDate === '2026-06-04';
    });

    // Build CSV headers
    const headers = ['First Name', 'Company', 'Address', 'City', 'State', 'ZIP', 'Phone', 'Email', 'Visit Context', 'Notes', 'Visit Date'];
    
    // Extract visit context from custom fields
    const getVisitContext = (contact: any) => {
      if (!contact.customFields) return '';
      const field = contact.customFields.find((f: any) => 
        f.key === 'contact.visit_context' || f.id === 'JxkUDvOziE2UkuwY8Um3'
      );
      return field?.value || '';
    };

    // Get clean notes (first note body if exists)
    const getNotes = (contact: any) => {
      if (contact.notes && contact.notes.length > 0) {
        return contact.notes[0].body || '';
      }
      return '';
    };

    const rows = recentContacts.map((c: any) => {
      const firstName = c.firstName || (c.contactName ? c.contactName.split(' ')[0] : '');
      const visitDate = c.dateAdded ? c.dateAdded.split('T')[0] : '';
      
      return [
        firstName,
        c.companyName || '',
        c.address1 || '',
        c.city || '',
        c.state || '',
        c.postalCode || '',
        c.phone || '',
        c.email || '',
        getVisitContext(c),
        getNotes(c),
        visitDate
      ];
    });

    // Escape and format CSV
    const escapeCsv = (val: string) => {
      const str = String(val || '').replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="comcast-visits-${today}.csv"`
      }
    });

  } catch (err) {
    console.error('Error generating CSV:', err);
    return NextResponse.json({ 
      error: 'Failed to generate CSV',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
