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

# Export to CSV with mail merge format per 2026-06-16 instructions
# Separate first/last names, Dr. prefix preserved in first name
sqlite3 "$DB_PATH" <<EOF > "$OUTPUT_PATH"
.headers on
.mode csv
SELECT 
    business_name as 'Business Name',
    contact_name as 'Contact Name (Original)',
    COALESCE(decision_maker_first_name, 
        CASE 
            WHEN contact_name LIKE 'Dr.%' OR contact_name LIKE 'Dr %' THEN
                CASE 
                    WHEN length(contact_name) - length(replace(contact_name, ' ', '')) >= 2 THEN
                        substr(contact_name, 1, instr(substr(contact_name, 4), ' ') + 3)
                    ELSE contact_name
                END
            ELSE 
                CASE 
                    WHEN instr(contact_name, ' ') > 0 THEN substr(contact_name, 1, instr(contact_name, ' ') - 1)
                    ELSE contact_name
                END
        END
    ) as 'First Name',
    COALESCE(decision_maker_last_name,
        CASE 
            WHEN contact_name LIKE 'Dr.%' OR contact_name LIKE 'Dr %' THEN
                CASE 
                    WHEN length(contact_name) - length(replace(contact_name, ' ', '')) >= 2 THEN
                        trim(substr(substr(contact_name, instr(contact_name, ' ') + 1), instr(substr(contact_name, instr(contact_name, ' ') + 1), ' ') + 1))
                    ELSE ''
                END
            ELSE 
                CASE 
                    WHEN instr(contact_name, ' ') > 0 THEN substr(contact_name, instr(contact_name, ' ') + 1)
                    ELSE ''
                END
        END
    ) as 'Last Name',
    gatekeeper_first_name as 'Gatekeeper First Name',
    gatekeeper_last_name as 'Gatekeeper Last Name',
    decision_maker_first_name as 'Decision Maker First Name',
    decision_maker_last_name as 'Decision Maker Last Name',
    phone as 'Phone',
    email as 'Email',
    address as 'Address',
    city as 'City',
    state as 'State',
    zip_code as 'ZIP',
    visit_status as 'Status',
    visit_context as 'Visit Context',
    notes as 'Notes',
    date(visit_date) as 'Visit Date'
FROM business_visits 
WHERE contact_name IS NOT NULL OR business_name IS NOT NULL
ORDER BY visit_date DESC;
EOF

echo "Export completed: $OUTPUT_PATH"
echo "Records exported: $(wc -l < "$OUTPUT_PATH")"
