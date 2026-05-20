#!/bin/bash
# Quick script to add a visit to the database
# Usage: ./add-visit.sh "Business Name" "Address" "Contact" "Phone" "Email" "Status" "Notes"

set -e

DB_PATH="/Users/xfinch/.openclaw/workspace/comcast-crm/daily-visits.db"
VISIT_DATE=$(date +%Y-%m-%d)

BUSINESS_NAME="${1:-}"
ADDRESS="${2:-}"
CONTACT_NAME="${3:-}"
PHONE="${4:-}"
EMAIL="${5:-}"
STATUS="${6:-New}"
NOTES="${7:-}"

if [ -z "$BUSINESS_NAME" ]; then
    echo "Usage: $0 \"Business Name\" \"Address\" \"Contact\" \"Phone\" \"Email\" \"Status\" \"Notes\""
    exit 1
fi

sqlite3 "$DB_PATH" <<EOF
INSERT INTO daily_visits (
    visit_date, business_name, address, contact_name, 
    phone, email, status, notes
) VALUES (
    '${VISIT_DATE}',
    '$(echo "$BUSINESS_NAME" | sed "s/'/''/g")',
    '$(echo "$ADDRESS" | sed "s/'/''/g")',
    '$(echo "$CONTACT_NAME" | sed "s/'/''/g")',
    '$(echo "$PHONE" | sed "s/'/''/g")',
    '$(echo "$EMAIL" | sed "s/'/''/g")',
    '${STATUS}',
    '$(echo "$NOTES" | sed "s/'/''/g")'
);
EOF

echo "Visit added for ${BUSINESS_NAME} on ${VISIT_DATE}"