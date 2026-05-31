#!/bin/bash
# Geocode visits in SQLite database using Nominatim API

cd /Users/xfinch/.openclaw/workspace/comcast-crm

DB="comcast.db"

# Get visits needing geocoding
sqlite3 "$DB" "SELECT id, business_name, address, city, zip_code FROM business_visits WHERE lat IS NULL AND (address IS NOT NULL OR zip_code IS NOT NULL);" | while IFS='|' read -r id name address city zip; do
    # Build query address - use address if it has city/state/zip, otherwise construct it
    if echo "$address" | grep -q "Tacoma.*WA.*[0-9]\{5\}"; then
        query="$address"
    else
        query="${address}, ${city}, WA ${zip}"
    fi
    
    echo "Geocoding: $name"
    echo "  Query: $query"
    
    # Call Nominatim API
    encoded=$(echo "$query" | python3 -c "import sys,urllib.parse; print(urllib.parse.quote(sys.stdin.read().strip()))")
    response=$(curl -s "https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1" -H "User-Agent: DaequanAI-ComcastCRM/1.0")
    
    # Extract lat/lng
    lat=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['lat'] if d else '')")
    lng=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['lon'] if d else '')")
    
    if [ -n "$lat" ] && [ -n "$lng" ]; then
        echo "  -> SUCCESS: $lat, $lng"
        sqlite3 "$DB" "UPDATE business_visits SET lat = $lat, lng = $lng WHERE id = $id;"
    else
        echo "  -> FAILED (empty response)"
    fi
    
    # Rate limiting - Nominatim requires 1 request per second
    sleep 1.1
done

echo "Done!"
