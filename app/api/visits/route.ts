import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'comcast-crm', 'comcast.db');

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
    
    let query = `
      SELECT 
        id as _id,
        business_name as businessName,
        contact_name as contactName,
        phone,
        email,
        address,
        city,
        zip_code as zip,
        visit_status as status,
        notes,
        lat,
        lng,
        visit_date as createdAt
      FROM business_visits
    `;
    let params: any[] = [];
    
    if (date) {
      query += ' WHERE date(visit_date) = date(?)';
      params.push(date);
    }
    
    query += ' ORDER BY visit_date DESC';
    
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
      businessName,
      contactName,
      phone,
      email,
      address,
      city,
      zip,
      status,
      notes,
      lat,
      lng
    } = body;

    const result = await runInsert(db, `
      INSERT INTO business_visits (
        business_name, contact_name, phone, email, 
        address, city, zip_code, visit_status, notes,
        lat, lng, visit_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      businessName,
      contactName,
      phone,
      email,
      address,
      city || 'Tacoma',
      zip,
      status || 'interested',
      notes,
      lat,
      lng
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
