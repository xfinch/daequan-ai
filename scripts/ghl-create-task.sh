#!/bin/bash
# Create GHL Task from Email Alert
# Usage: ./ghl-create-task.sh "Priority" "Subject" "Body" [ContactID]

PRIORITY="$1"
SUBJECT="$2"
BODY="$3"
CONTACT_ID="${4:-}"

LOCATION_ID="mhvGjZGZPcsK3vgjEDwI"
TOKEN=$(security find-generic-password -a "ghl-ttl-token" -s "ghl-ttl-token" -w 2>/dev/null || echo "$GHL_TOKEN")

if [ -z "$TOKEN" ]; then
    echo "Error: GHL token not found"
    exit 1
fi

# Map priority to due date
DUE_DATE=""
case "$PRIORITY" in
    P0)
        DUE_DATE=$(date -v+5M +%s)  # 5 minutes
        ;;
    P1)
        DUE_DATE=$(date -v+10M +%s)  # 10 minutes
        ;;
    P2)
        DUE_DATE=$(date -v+2H +%s)   # 2 hours
        ;;
    *)
        DUE_DATE=$(date -v+1d +%s)   # 1 day
        ;;
esac

# Create task payload
PAYLOAD=$(cat <<EOF
{
  "title": "[$PRIORITY] $SUBJECT",
  "body": "$BODY",
  "dueDate": $DUE_DATE,
  "assignedTo": "",
  "completed": false
}
EOF
)

# Create task via GHL API
curl -s -X POST \
    "https://services.leadconnectorhq.com/locations/$LOCATION_ID/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"

echo "Task created: [$PRIORITY] $SUBJECT"
