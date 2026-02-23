import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ 
      status: 'ok', 
      mongo: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({ 
      status: 'error', 
      mongo: false,
      error: (err as Error).message
    }, { status: 500 });
  }
}
