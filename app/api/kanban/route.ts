import { NextRequest, NextResponse } from 'next/server';
import { getKanbanData } from '@/lib/kanban-parser';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'ttl';
  
  const data = getKanbanData(type);
  
  if (!data) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 });
  }
  
  return NextResponse.json(data);
}
