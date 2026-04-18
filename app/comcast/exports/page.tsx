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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCsvFiles();
  }, []);

  const fetchCsvFiles = async () => {
    try {
      const res = await fetch('/comcast-visits.csv');
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        const recordCount = lines.length > 1 ? lines.length - 1 : 0;
        
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
      
      // Parse CSV and format for Comcast systems
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',');
      
      // Find key indices
      const businessIdx = headers.findIndex(h => h.toLowerCase().includes('business'));
      const contactIdx = headers.findIndex(h => h.toLowerCase().includes('contact'));
      const phoneIdx = headers.findIndex(h => h.toLowerCase().includes('phone'));
      const emailIdx = headers.findIndex(h => h.toLowerCase().includes('email'));
      const addressIdx = headers.findIndex(h => h.toLowerCase().includes('address'));
      const statusIdx = headers.findIndex(h => h.toLowerCase().includes('status'));
      const notesIdx = headers.findIndex(h => h.toLowerCase().includes('notes'));
      
      // Format for clipboard - tab-separated for easy paste into spreadsheets
      const formattedData = lines.slice(1).map(line => {
        const cols = line.split(',');
        return [
          cols[businessIdx]?.replace(/"/g, '') || '',
          cols[contactIdx]?.replace(/"/g, '') || '',
          cols[phoneIdx]?.replace(/"/g, '') || '',
          cols[emailIdx]?.replace(/"/g, '') || '',
          cols[addressIdx]?.replace(/"/g, '') || '',
          cols[statusIdx]?.replace(/"/g, '') || '',
          cols[notesIdx]?.replace(/"/g, '') || ''
        ].join('\t');
      }).join('\n');
      
      const headerRow = ['Business', 'Contact', 'Phone', 'Email', 'Address', 'Status', 'Notes'].join('\t');
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
              <li>Download the CSV or click "Copy for Comcast" to copy formatted data</li>
              <li>Open Comcast Business Portal or your CRM system</li>
              <li>Paste the data or import the CSV file</li>
              <li>Follow up on prospects by status (interested, follow-up, etc.)</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
