#!/bin/bash
# Remove pipeline stage tags from contacts (they belong in Opportunities, not tags)

set -e

TOKEN="$(launchctl getenv GHL_COMCAST_TOKEN)"
LOCATION_ID="nPubo6INanVq94ovAQNW"

if [ -z "$TOKEN" ]; then
    echo "Error: GHL_COMCAST_TOKEN not set"
    exit 1
fi

# Tags to remove (pipeline stages belong in Opportunities)
PIPELINE_TAGS=("status: new" "status: analysis" "status: closed lost" "status: existing" "initial_contact" "new")

echo "Pipeline Tag Removal Script"
echo "==========================="
echo ""
echo "Removing the following tags from contacts:"
for tag in "${PIPELINE_TAGS[@]}"; do
    echo "  - $tag"
done
echo ""

# Contacts with pipeline tags (from backup/audit)
# Format: contact_id|name
CONTACT_LIST=(
    "tnzq5mXpfmUIiLH8n8oD|jordan rodriguez"
    "bQaYw1z5x44Z5fLGFeGg|owner (name unknown)"
    "MugA7YmxDe8mS6o49TX6|will null"
    "kz1vUht2UJ2SplN0VhYw|scotty james"
    "jjfmnIn1BSFoGCawprgN|paige, leilani"
    "EehIWhmKCiXyCf7gj0c1|reginald jacobs"
    "OgQ5hwQIveKS2VW85DsM|dave/nate"
    "Fr8jD8w1LE3zZN1OHQ4z|will pearson"
    "lRlHZMzOQBTNBu7iIM4j|kristy johnson"
    "s4AQlO3MGAgFibeKaJJH|eric null"
    "BSWDHtyrX7L62YPIQSa6|sarah butters"
    "Izey2DrJXbly9qLBME55|melissa null"
    "uyFTh4HNC8JdYjaDFwm6|marie null"
    "l7Le9y7Fck2bgBqRp9bL|tuan null"
    "VFUvK4l6nNLXpSptl3vG|justin null"
    "42wlERL358n0BwcVtdk3|sarah null"
    "uI12m7d1ojNOPa0LW6cH|andrew null"
    "ME9RBeRpPDxXxmzQxCMg|long null"
    "IzL56XdqbX61xOyq4s5N|greg null"
    "eTe95F1GZrbmWPjCaVNP|paul drumheller"
)

for entry in "${CONTACT_LIST[@]}"; do
    contact_id="${entry%%|*}"
    name="${entry##*|}"
    
    echo ""
    echo "Processing: $name ($contact_id)"
    
    # Get current contact
    response=$(curl -s "https://services.leadconnectorhq.com/contacts/$contact_id" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Version: 2021-07-28" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    if [ -z "$response" ] || [ "$response" = "null" ]; then
        echo "  ERROR: Could not fetch contact"
        continue
    fi
    
    # Check for errors
    error_msg=$(echo "$response" | jq -r '.message // empty' 2>/dev/null)
    if [ -n "$error_msg" ]; then
        echo "  API Error: $error_msg"
        continue
    fi
    
    # Get current tags as array
    current_tags_json=$(echo "$response" | jq -c '.contact.tags // []' 2>/dev/null)
    
    if [ -z "$current_tags_json" ] || [ "$current_tags_json" = "[]" ]; then
        echo "  No tags found"
        continue
    fi
    
    # Build new tags array excluding pipeline tags
    new_tags_json=$(echo "$current_tags_json" | jq -c '[.[] | select(. as $tag | 
        ["status: new", "status: analysis", "status: closed lost", "status: existing", "initial_contact", "new"] | index($tag) | not)]' 2>/dev/null)
    
    if [ "$current_tags_json" = "$new_tags_json" ]; then
        echo "  No pipeline tags to remove"
        continue
    fi
    
    old_count=$(echo "$current_tags_json" | jq 'length')
    new_count=$(echo "$new_tags_json" | jq 'length')
    removed=$((old_count - new_count))
    
    echo "  Tags: $old_count → $new_count (removed $removed)"
    
    # Update contact with new tags
    update_response=$(curl -s -X PUT "https://services.leadconnectorhq.com/contacts/$contact_id" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Version: 2021-07-28" \
        -H "Content-Type: application/json" \
        -d "{\"tags\": $new_tags_json}" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$update_response" ]; then
        error=$(echo "$update_response" | jq -r '.message // empty' 2>/dev/null)
        if [ -n "$error" ]; then
            echo "  ✗ API Error: $error"
        else
            echo "  ✓ Updated"
        fi
    else
        echo "  ✗ Failed to update"
    fi
done

echo ""
echo "Done! Pipeline stage tags removed."
echo ""
echo "Next steps:"
echo "  1. Verify in GHL that pipeline stages are set correctly"
echo "  2. Run bulk tag renames (comcast-prospect → prospect, etc.)"
