import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'comcast-crm', 'daily-visits.db');

// Helper to run queries with promises
function runQuery(db: sqlite3.Database, sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function runInsert(db: sqlite3.Database, sql: string, params: any[]): Promise<{ lastID: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

// GET /api/visits?date=2026-05-19
export async function GET(request: NextRequest) {
  const db = new sqlite3.Database(dbPath);
  
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let query = 'SELECT * FROM daily_visits';
    let params: any[] = [];
    
    if (date) {
      query += ' WHERE visit_date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const visits = await runQuery(db, query, params);
    
    return NextResponse.json({ visits });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  } finally {
    db.close();
  }
}

// POST /api/visits
export async function POST(request: NextRequest) {
  const db = new sqlite3.Database(dbPath);
  
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

    const result = await runInsert(db, `
      INSERT INTO daily_visits (
        visit_date, business_name, address, city, state, zip_code,
        contact_name, contact_title, phone, email, status, notes,
        follow_up_needed, products_discussed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
    ]);
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastID 
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  } finally {
    db.close();
  }
}
