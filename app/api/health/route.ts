import { NextResponse } from 'next/server';

export async function GET() {
  // Simple health check - don't require DB for basic uptime
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  });
}
