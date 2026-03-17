#!/bin/bash
# Sync GHL Comcast Prospects to Local Map Database
# Uses curl and sqlite3 CLI

GHL_TOKEN="$(launchctl getenv GHL_COMCAST_TOKEN)"
GHL_LOCATION_ID="nPubo6INanVq94ovAQNW"
DB_PATH="/Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db"

echo "🚀 Syncing GHL Prospects to Local Map Database"
echo ""

# Fetch contacts from GHL
echo "📥 Fetching contacts from GHL..."
CONTACTS=$(curl -s "https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=100" \
  -H "Authorization: Bearer ${GHL_TOKEN}" \
  -H "Version: 2021-04-15")

# Count contacts
CONTACT_COUNT=$(echo "$CONTACTS" | jq -r '.contacts | length')
echo "   Found $CONTACT_COUNT contacts"
echo ""

# Process each contact
echo "💾 Syncing to local database..."
echo ""

ADDED=0
EXISTING=0
FAILED=0

# Loop through contacts
for i in $(seq 0 $(($CONTACT_COUNT - 1))); do
  CONTACT=$(echo "$CONTACTS" | jq -r ".contacts[$i]")
  
  EMAIL=$(echo "$CONTACT" | jq -r '.email // empty')
  NAME=$(echo "$CONTACT" | jq -r '.contactName // .companyName // "Unknown"')
  
  if [ -z "$EMAIL" ]; then
    echo "[$((i+1))/$CONTACT_COUNT] $NAME - ⏭️  Skipped: No email"
    continue
  fi
  
  # Check if exists
  EXISTS=$(sqlite3 "$DB_PATH" "SELECT id FROM business_visits WHERE email = '$EMAIL' LIMIT 1;" 2>/dev/null)
  
  if [ -n "$EXISTS" ]; then
    echo "[$((i+1))/$CONTACT_COUNT] $NAME - ⚪ Already exists"
    EXISTING=$((EXISTING + 1))
    continue
  fi
  
  # Extract fields
  GHL_ID=$(echo "$CONTACT" | jq -r '.id')
  COMPANY=$(echo "$CONTACT" | jq -r '.companyName // .contactName // ""' | sed "s/'/''/g")
  CONTACT_NAME=$(echo "$CONTACT" | jq -r '.contactName // ""' | sed "s/'/''/g")
  PHONE=$(echo "$CONTACT" | jq -r '.phone // ""')
  ADDRESS=$(echo "$CONTACT" | jq -r '.address1 // ""' | sed "s/'/''/g")
  CITY=$(echo "$CONTACT" | jq -r '.city // "Tacoma"' | sed "s/'/''/g")
  STATE=$(echo "$CONTACT" | jq -r '.state // "WA"')
  ZIP=$(echo "$CONTACT" | jq -r '.postalCode // ""')
  WEBSITE=$(echo "$CONTACT" | jq -r '.website // ""')
  TAGS=$(echo "$CONTACT" | jq -r '.tags | join(", ")' | sed "s/'/''/g")
  
  # Determine status based on tags
  STATUS="interested"
  if echo "$TAGS" | grep -qi "follow-up"; then
    STATUS="followup"
  elif echo "$TAGS" | grep -qi "hot-lead"; then
    STATUS="interested"
  fi
  
  # Insert
  NOTES="Synced from GHL. Tags: $TAGS"
  
  INSERT_SQL="INSERT INTO business_visits (
    ghl_contact_id, ghl_location_id, business_name, contact_name,
    phone, email, address, city, state, zip_code,
    website, visit_status, notes, source, synced_to_ghl
  ) VALUES (
    '$GHL_ID', '$GHL_LOCATION_ID', '$COMPANY', '$CONTACT_NAME',
    '$PHONE', '$EMAIL', '$ADDRESS', '$CITY', '$STATE', '$ZIP',
    '$WEBSITE', '$STATUS', '$NOTES', 'GHL Sync', 1
  );"
  
  RESULT=$(sqlite3 "$DB_PATH" "$INSERT_SQL" 2>&1)
  
  if [ $? -eq 0 ]; then
    echo "[$((i+1))/$CONTACT_COUNT] $NAME - ✅ Added"
    ADDED=$((ADDED + 1))
  else
    echo "[$((i+1))/$CONTACT_COUNT] $NAME - ❌ Failed: $RESULT"
    FAILED=$((FAILED + 1))
  fi
  
  # Small delay
  sleep 0.1
done

echo ""
echo "=================================================="
echo "📊 SYNC SUMMARY"
echo "=================================================="
echo "✅ Added: $ADDED"
echo "⚪ Existing: $EXISTING"
echo "❌ Failed: $FAILED"
echo ""
echo "Map should now show all pins at daequanai.com/comcast"
