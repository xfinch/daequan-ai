-- SQLite schema for daily visit tracking
-- Creates tables for storing Comcast territory visits

CREATE TABLE IF NOT EXISTS daily_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_date DATE NOT NULL,
    business_name TEXT NOT NULL,
    address TEXT,
    city TEXT DEFAULT 'Tacoma',
    state TEXT DEFAULT 'WA',
    zip_code TEXT,
    contact_name TEXT,
    contact_title TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'New',
    notes TEXT,
    follow_up_needed BOOLEAN DEFAULT 0,
    products_discussed TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_visit_date ON daily_visits(visit_date);

-- Index for business name search
CREATE INDEX IF NOT EXISTS idx_business_name ON daily_visits(business_name);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_status ON daily_visits(status);