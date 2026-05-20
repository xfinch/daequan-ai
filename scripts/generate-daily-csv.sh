#!/bin/bash
# Generate daily CSV export of Comcast visits
# Run via cron at 6 PM daily

set -e

# Get today's date
TODAY=$(date +%Y-%m-%d)
OUTPUT_DIR="/Users/xfinch/.openclaw/workspace/public/exports"
OUTPUT_FILE="${OUTPUT_DIR}/comcast-visits-${TODAY}.csv"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Generate CSV from SQLite
sqlite3 /Users/xfinch/.openclaw/workspace/comcast-crm/daily-visits.db <<EOF
.headers on
.mode csv
.output ${OUTPUT_FILE}
SELECT 
    visit_date as "Date",
    business_name as "Business Name",
    address as "Address",
    city as "City",
    state as "State",
    zip_code as "ZIP",
    contact_name as "Contact Name",
    contact_title as "Title",
    phone as "Phone",
    email as "Email",
    status as "Status",
    notes as "Notes",
    CASE WHEN follow_up_needed = 1 THEN 'Yes' ELSE 'No' END as "Follow Up Needed",
    products_discussed as "Products Discussed"
FROM daily_visits 
WHERE visit_date = '${TODAY}'
ORDER BY created_at;
EOF

# Check if file has data (more than just headers)
LINE_COUNT=$(wc -l < "$OUTPUT_FILE")

if [ "$LINE_COUNT" -le 1 ]; then
    echo "No visits recorded for ${TODAY}"
    # Remove empty file
    rm "$OUTPUT_FILE"
    exit 0
fi

echo "Generated: ${OUTPUT_FILE}"
echo "Records: $((LINE_COUNT - 1))"

# Also create/update the symlink for latest
LATEST_LINK="${OUTPUT_DIR}/comcast-visits-latest.csv"
ln -sf "$(basename "$OUTPUT_FILE")" "$LATEST_LINK"

echo "Daily CSV export complete for ${TODAY}"