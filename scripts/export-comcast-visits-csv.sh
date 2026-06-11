#!/bin/bash
# Export Comcast visits from SQLite to CSV
# This script is run daily via cron at 6 AM PT

set -e

WORKSPACE_DIR="/Users/xfinch/.openclaw/workspace"
DB_PATH="$WORKSPACE_DIR/comcast-crm/comcast.db"
OUTPUT_PATH="$WORKSPACE_DIR/public/comcast-visits.csv"

# Ensure the database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database not found at $DB_PATH"
    exit 1
fi

# Export to CSV with proper headers matching the current format
sqlite3 "$DB_PATH" <<EOF > "$OUTPUT_PATH"
.headers on
.mode csv
SELECT 
    contact_name as 'First Name',
    business_name as 'Company',
    address as 'Address',
    city as 'City',
    state as 'State',
    zip_code as 'ZIP',
    phone as 'Phone',
    email as 'Email',
    visit_context as 'Visit Context',
    notes as 'Notes',
    date(visit_date) as 'Visit Date'
FROM business_visits 
WHERE contact_name IS NOT NULL OR business_name IS NOT NULL
ORDER BY visit_date DESC;
EOF

echo "Export completed: $OUTPUT_PATH"
echo "Records exported: $(wc -l < "$OUTPUT_PATH")"
