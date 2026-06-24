'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/ui/navbar';

interface CsvFile {
  name: string;
  date: string;
  location: string;
  recordCount: number;
  path: string;
}

interface TodayLead {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip_code: string;
  visit_status: string;
  visit_date: string;
  notes: string;
}

// Simple SVG icons
const FileTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
);

export default function ExportsPage() {
  const [files, setFiles] = useState<CsvFile[]>([]);
  const [todayLeads, setTodayLeads] = useState<TodayLead[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    fetchCsvFiles();
    fetchTodayLeads();
    setTodayDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Parse CSV properly handling quoted fields with newlines
  const parseCSV = (text: string): string[][] => {
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
  };

  const fetchCsvFiles = async () => {
    try {
      const res = await fetch('/comcast-visits.csv');
      if (res.ok) {
        const text = await res.text();
        const rows = parseCSV(text.trim());
        const recordCount = rows.length > 1 ? rows.length - 1 : 0; // Subtract header row
        
        setFiles([{
          name: 'comcast-visits.csv',
          date: new Date().toISOString().split('T')[0],
          location: 'All Territories',
          recordCount,
          path: '/comcast-visits.csv'
        }]);
      }
    } catch (e) {
      console.error('Failed to load CSV files', e);
    }
    setLoading(false);
  };

  const fetchTodayLeads = async () => {
    try {
      const res = await fetch('/api/visits/today');
      if (res.ok) {
        const data = await res.json();
        setTodayLeads(data.leads);
        setTodayCount(data.count);
      }
    } catch (e) {
      console.error('Failed to fetch today\'s leads', e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodayLeads();
    setRefreshing(false);
  };

  // Parse name for mail merge: "John Smith" or "Dr. John Smith" -> [first, last]
  const parseNameForMailMerge = (fullName: string): [string, string] => {
    if (!fullName) return ['', ''];
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return ['', ''];
    if (parts.length === 1) return [parts[0], ''];
    // Check for Dr. prefix - keep it in first name
    if (parts[0].toLowerCase() === 'dr.' || parts[0].toLowerCase() === 'dr') {
      if (parts.length >= 3) {
        return [`${parts[0]} ${parts[1]}`, parts[2]];
      } else {
        return [`${parts[0]} ${parts[1]}`, ''];
      }
    }
    // Standard: last part is last name, rest is first name
    return [parts.slice(0, -1).join(' '), parts[parts.length - 1]];
  };

  const downloadTodayCsv = () => {
    if (todayLeads.length === 0) return;
    
    // Headers per 2026-06-16 instructions: separate first/last names for mail merge
    const headers = ['Business Name', 'Contact Name (Original)', 'First Name', 'Last Name', 'Phone', 'Email', 'Address', 'City', 'ZIP', 'Status', 'Visit Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...todayLeads.map(lead => {
        const [firstName, lastName] = parseNameForMailMerge(lead.contact_name);
        return [
          lead.business_name,
          lead.contact_name || '',
          firstName,
          lastName,
          lead.phone || '',
          lead.email || '',
          lead.address || '',
          lead.city || '',
          lead.zip_code || '',
          lead.visit_status || '',
          lead.visit_date || '',
          lead.notes || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comcast-leads-${todayDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyForComcast = async (path: string) => {
    try {
      const res = await fetch(path);
      const text = await res.text();
      
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      const businessIdx = headers.findIndex(h => h.toLowerCase().includes('business'));
      const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact') && !h.toLowerCase().includes('original'));
      const firstNameIdx = headers.findIndex(h => h.toLowerCase() === 'first name');
      const lastNameIdx = headers.findIndex(h => h.toLowerCase() === 'last name');
      const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone'));
      const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
      const addressIdx = headers.findIndex(h => h.toLowerCase().includes('address'));
      const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
      const notesIdx = headers.findIndex(h => h.toLowerCase().includes('notes'));
      
      const formattedData = lines.slice(1).map(line => {
        const cols = line.split(',');
        // Use parsed first/last name if available, otherwise parse from contact name
        let firstName = cols[firstNameIdx]?.replace(/"/g, '') || '';
        let lastName = cols[lastNameIdx]?.replace(/"/g, '') || '';
        const contactName = cols[contactIdx]?.replace(/"/g, '') || '';
        
        if (!firstName && !lastName && contactName) {
          [firstName, lastName] = parseNameForMailMerge(contactName);
        }
        
        return [
          cols[businessIdx]?.replace(/"/g, '') || '',
          firstName,
          lastName,
          cols[phoneIdx]?.replace(/"/g, '') || '',
          cols[emailIdx]?.replace(/"/g, '') || '',
          cols[addressIdx]?.replace(/"/g, '') || '',
          cols[statusIdx]?.replace(/"/g, '') || '',
          cols[notesIdx]?.replace(/"/g, '') || ''
        ].join('\t');
      }).join('\n');
      
      const headerRow = ['Business', 'First Name', 'Last Name', 'Phone', 'Email', 'Address', 'Status', 'Notes'].join('\t');
      const clipboardText = headerRow + '\n' + formattedData;
      
      await navigator.clipboard.writeText(clipboardText);
      alert('Copied to clipboard! Paste into Comcast systems or Excel.');
    } catch (e) {
      alert('Failed to copy data');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Comcast Exports</h1>
            <p className="text-muted-foreground">
              Download visit data for follow-up in Comcast systems
            </p>
          </div>

          {/* Today's Leads Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today&apos;s Leads ({todayCount})</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent/10 transition-colors disabled:opacity-50"
                >
                  {refreshing ? <Spinner /> : <RefreshIcon />}
                  Refresh
                </button>
                {todayCount > 0 && (
                  <button
                    onClick={downloadTodayCsv}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                  >
                    <DownloadIcon />
                    Download Today&apos;s CSV
                  </button>
                )}
              </div>
            </div>

            {todayCount === 0 ? (
              <div className="p-6 bg-muted/50 rounded-xl text-center">
                <p className="text-muted-foreground">No contacts found for today.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click refresh to check for new leads, or download all contacts below.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Business</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {todayLeads.map((lead, idx) => (
                        <tr key={idx} className="hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">{lead.business_name}</td>
                          <td className="px-4 py-3 text-sm">{lead.contact_name || '-'}</td>
                          <td className="px-4 py-3 text-sm">{lead.phone || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              lead.visit_status === 'interested' ? 'bg-green-500/20 text-green-400' :
                              lead.visit_status === 'follow-up' ? 'bg-yellow-500/20 text-yellow-400' :
                              lead.visit_status === 'not-interested' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {lead.visit_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* All Contacts Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">All Contacts</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Spinner />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                  <FileTextIcon />
                </div>
                <p>No export files found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg text-accent">
                          <FileTextIcon />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{file.name}</h3>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon />
                              {file.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPinIcon />
                              {file.location}
                            </span>
                            <span>{file.recordCount} records</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyForComcast(file.path)}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent/10 transition-colors"
                        >
                          Copy for Comcast
                        </button>
                        <button
                          onClick={() => handleDownload(file.path, file.name)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                        >
                          <DownloadIcon />
                          Download CSV
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/comcast"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <MapPinIcon />
              </div>
              <div>
                <h4 className="font-medium">View Territory Map</h4>
                <p className="text-sm text-muted-foreground">See all visits on the map</p>
              </div>
              <div className="ml-auto text-muted-foreground">
                <ExternalLinkIcon />
              </div>
            </a>

            <a
              href="https://business.comcast.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-accent/50 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <ExternalLinkIcon />
              </div>
              <div>
                <h4 className="font-medium">Comcast Business Portal</h4>
                <p className="text-sm text-muted-foreground">Open Comcast systems</p>
              </div>
              <div className="ml-auto text-muted-foreground">
                <ExternalLinkIcon />
              </div>
            </a>
          </div>

          {/* Instructions */}
          <div className="mt-12 p-6 bg-muted/50 rounded-xl">
            <h4 className="font-semibold mb-3">How to use these exports</h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Check &quot;Today&apos;s Leads&quot; for new contacts added today</li>
              <li>Click refresh to check for new leads in real-time</li>
              <li>Download today&apos;s CSV or all contacts for follow-up</li>
              <li>Open Comcast Business Portal or your CRM system</li>
              <li>Paste the data or import the CSV file</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
