import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'comcast-crm', 'daily-visits.db');

// GET /api/visits?date=2026-05-19
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    const db = new Database(dbPath);
    
    let query = 'SELECT * FROM daily_visits';
    let params: any[] = [];
    
    if (date) {
      query += ' WHERE visit_date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const visits = db.prepare(query).all(...params);
    db.close();
    
    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

// POST /api/visits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visit_date,
      business_name,
      address,
      city,
      state,
      zip_code,
      contact_name,
      contact_title,
      phone,
      email,
      status,
      notes,
      follow_up_needed,
      products_discussed
    } = body;

    const db = new Database(dbPath);
    
    const result = db.prepare(`
      INSERT INTO daily_visits (
        visit_date, business_name, address, city, state, zip_code,
        contact_name, contact_title, phone, email, status, notes,
        follow_up_needed, products_discussed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      visit_date || new Date().toISOString().split('T')[0],
      business_name,
      address,
      city || 'Tacoma',
      state || 'WA',
      zip_code,
      contact_name,
      contact_title,
      phone,
      email,
      status || 'New',
      notes,
      follow_up_needed ? 1 : 0,
      products_discussed
    );
    
    db.close();
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}