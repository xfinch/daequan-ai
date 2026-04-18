#!/bin/bash
# Nightly export of Comcast CRM visits
# Runs at 6 PM daily

set -e

DATE=$(date +%Y-%m-%d)
EXPORT_DIR="/Users/xfinch/.openclaw/workspace/public/exports"
CSV_FILE="$EXPORT_DIR/comcast_visits_$DATE.csv"
LATEST_LINK="/Users/xfinch/.openclaw/workspace/public/exports/latest.csv"

# Create exports directory if needed
mkdir -p "$EXPORT_DIR"

# Export all visits from SQLite
cd /Users/xfinch/.openclaw/workspace/comcast-crm

sqlite3 comcast.db << EOF > "$CSV_FILE"
.headers on
.mode csv
SELECT 
  id,
  business_name,
  contact_name,
  phone,
  email,
  website,
  address,
  city,
  state,
  zip_code,
  visit_status,
  visit_date,
  notes,
  source,
  ghl_contact_id
FROM business_visits 
ORDER BY visit_date DESC;
EOF

# Update latest symlink
ln -sf "$CSV_FILE" "$LATEST_LINK"

# Count records
RECORDS=$(wc -l < "$CSV_FILE")
RECORDS=$((RECORDS - 1))  # Subtract header

# Send email with link
himalaya template send << EMAIL
From: xavier@thetraffic.link
To: Comcast.xavier@gmail.com
Subject: Comcast Visits Export - $DATE

Daily Comcast CRM Export

Date: $DATE
Total Records: $RECORDS

Download Links:
- Today's Export: https://daequanai.com/exports/comcast_visits_$DATE.csv
- Latest (always current): https://daequanai.com/exports/latest.csv

All historical exports: https://daequanai.com/exports/

---
Automated by Daequan
EMAIL

echo "Export complete: $CSV_FILE ($RECORDS records)"
