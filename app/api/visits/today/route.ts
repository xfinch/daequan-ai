import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Parse CSV properly handling quoted fields with newlines and commas
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        if (char === '\r') i++; // Skip \n in \r\n
        currentRow.push(currentField);
        if (currentRow.length > 1 || currentRow[0] !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  
  // Handle last field/row
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  
  return rows;
}

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'comcast-visits.csv');
    const csvContent = await readFile(csvPath, 'utf-8');
    
    const rows = parseCSV(csvContent.trim());
    if (rows.length < 2) {
      return NextResponse.json({ date: new Date().toISOString().split('T')[0], count: 0, leads: [] });
    }
    
    const headers = rows[0];
    
    // Find indices
    const businessIdx = headers.findIndex(h => h.toLowerCase().includes('business'));
    const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact'));
    const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone'));
    const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
    const addressIdx = headers.findIndex(h => h.toLowerCase().includes('address'));
    const cityIdx = headers.findIndex(h => h.toLowerCase().includes('city'));
    const zipIdx = headers.findIndex(h => h.toLowerCase().includes('zip'));
    const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
    const dateIdx = headers.findIndex(h => h.toLowerCase().includes('date'));
    const notesIdx = headers.findIndex(h => h.toLowerCase().includes('notes'));
    
    // Get today's date in Pacific timezone (America/Los_Angeles)
    const today = new Date();
    const pacificDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(today);
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = pacificDate.split('/');
    const todayStr = `${year}-${month}-${day}`;
    
    // Filter for today's leads
    const todayLeads = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      const visitDate = cols[dateIdx] || '';
      // Check if visit date starts with today's date
      if (visitDate.startsWith(todayStr)) {
        todayLeads.push({
          business_name: cols[businessIdx] || '',
          contact_name: cols[contactIdx] || '',
          phone: cols[phoneIdx] || '',
          email: cols[emailIdx] || '',
          address: cols[addressIdx] || '',
          city: cols[cityIdx] || '',
          zip_code: cols[zipIdx] || '',
          visit_status: cols[statusIdx] || '',
          visit_date: visitDate,
          notes: cols[notesIdx] || ''
        });
      }
    }
    
    return NextResponse.json({
      date: todayStr,
      count: todayLeads.length,
      leads: todayLeads
    });
  } catch (error) {
    console.error('Error fetching today\'s leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s leads' },
      { status: 500 }
    );
  }
}
