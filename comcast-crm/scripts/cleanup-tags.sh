#!/bin/bash
# Comcast GHL Tag Cleanup Script
# Bulk rename deprecated tags to standardized versions

set -e

LOCATION_ID="nPubo6INanVq94ovAQNW"
TOKEN="${GHL_COMCAST_TOKEN:-$(launchctl getenv GHL_COMCAST_TOKEN)}"

if [ -z "$TOKEN" ]; then
    echo "Error: GHL_COMCAST_TOKEN not set"
    exit 1
fi

echo "Comcast GHL Tag Cleanup"
echo "======================="
echo "Location: $LOCATION_ID"
echo ""

# Function to rename a tag
rename_tag() {
    local old_tag="$1"
    local new_tag="$2"
    
    echo "Renaming '$old_tag' → '$new_tag'..."
    
    # Note: GHL API doesn't have a direct "rename tag" endpoint
    # We need to: 1) Find all contacts with old tag, 2) Add new tag, 3) Remove old tag
    # This is a placeholder - actual implementation requires pagination and rate limiting
    
    echo "  (Requires manual implementation via GHL UI or bulk API calls)"
}

# Bulk rename mappings
declare -A RENAMES=(
    ["comcast-prospect"]="prospect"
    ["interested"]="hot-lead"
    ["followup"]="follow-up"
    ["comcast visit"]="field-visit"
    ["customer"]="existing-customer"
    ["existing customer"]="existing-customer"
    ["status: existing"]="existing-customer"
    ["field_visit"]="field-visit"
    ["hot-prospect"]="hot-lead"
    ["multi-site"]="multi-location"
    ["not-a-prospect"]="not-interested"
)

echo "Planned renames:"
echo "----------------"
for old in "${!RENAMES[@]}"; do
    echo "  '$old' → '${RENAMES[$old]}'"
done

echo ""
echo "WARNING: GHL API doesn't support bulk tag rename directly."
echo "Options:"
echo "  1. Use GHL UI: Settings > Tags > Edit each tag name"
echo "  2. Use this script as a guide for manual cleanup"
echo "  3. Build a proper migration using contacts API (add new, remove old)"
echo ""
echo "Recommended approach: Manual UI cleanup for now."
echo ""

# Export list of contacts with deprecated tags for reference
echo "Exporting contacts with deprecated tags..."

# This would require actual API implementation with pagination
# For now, reference the report in tag-cleanup-report.md

echo "Done. See tag-cleanup-report.md for detailed instructions."
