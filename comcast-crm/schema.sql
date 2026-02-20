-- GHL Comcast Integration Schema
-- Middle layer database on Mac mini

-- Main business visits table
CREATE TABLE IF NOT EXISTS business_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ghl_contact_id TEXT UNIQUE,           -- GHL contact ID (null until synced)
    ghl_location_id TEXT,                  -- GHL location ID
    
    -- Business info
    business_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Location
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'WA',
    zip_code TEXT NOT NULL,               -- Your territory zip
    lat REAL,
    lng REAL,
    
    -- Visit tracking
    visit_status TEXT DEFAULT 'interested', -- interested, followup, not-interested, called, customer
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Media
    business_card_photo TEXT,              -- local path to photo
    ghl_attachment_url TEXT,               -- GHL attachment URL if uploaded
    
    -- Metadata
    source TEXT DEFAULT 'whatsapp',        -- whatsapp, manual, import
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_to_ghl BOOLEAN DEFAULT 0,
    last_sync_error TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_zip ON business_visits(zip_code);
CREATE INDEX IF NOT EXISTS idx_status ON business_visits(visit_status);
CREATE INDEX IF NOT EXISTS idx_ghl_id ON business_visits(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_synced ON business_visits(synced_to_ghl);

-- Sync log for debugging
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,                           -- create, update, delete
    table_name TEXT,
    record_id INTEGER,
    ghl_contact_id TEXT,
    status TEXT,                           -- success, error
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom fields mapping (what we store locally vs GHL)
CREATE TABLE IF NOT EXISTS ghl_field_mapping (
    local_field TEXT PRIMARY KEY,
    ghl_custom_field_key TEXT,
    ghl_field_type TEXT                    -- text, number, date, etc
);

-- Insert field mappings
INSERT OR IGNORE INTO ghl_field_mapping VALUES 
    ('zip_code', 'zip_code', 'text'),
    ('visit_status', 'visit_status', 'text'),
    ('visit_date', 'visit_date', 'date'),
    ('business_name', 'business_name', 'text'),
    ('contact_name', 'contact_name', 'text'),
    ('lat', 'latitude', 'number'),
    ('lng', 'longitude', 'number');
