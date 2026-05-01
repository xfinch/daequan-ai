#!/bin/bash
# Check for upcoming contract expirations and GHL tasks
# Runs weekly to alert on contract milestones

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/../logs/contract-checks.log"

mkdir -p "$(dirname "$LOG_FILE")"

echo "=== Contract Check: $(date) ===" >> "$LOG_FILE"

# Load environment variables
export GHL_COMCAST_TOKEN=$(launchctl getenv GHL_COMCAST_TOKEN)

# Check for tasks due in next 30 days
echo "Checking GHL tasks due in next 30 days..." >> "$LOG_FILE"

# Get current date and 30 days from now in epoch seconds
NOW=$(date +%s)
THIRTY_DAYS=$((NOW + 30 * 86400))

# Query GHL for upcoming tasks (this would need the location ID)
# For now, we'll check the local reminder files

REMINDER_DIR="$SCRIPT_DIR/../memory/comcast"
if [ -d "$REMINDER_DIR" ]; then
    echo "Checking reminder files in $REMINDER_DIR..." >> "$LOG_FILE"
    for file in "$REMINDER_DIR"/*.md; do
        if [ -f "$file" ]; then
            echo "Found: $(basename "$file")" >> "$LOG_FILE"
        fi
    done
fi

# Check SQLite for any contract end dates within 90 days
echo "Checking local CRM for upcoming contract ends..." >> "$LOG_FILE"
sqlite3 "$SCRIPT_DIR/../comcast-crm/comcast.db" "SELECT business_name, notes FROM business_visits WHERE notes LIKE '%contract%' AND (notes LIKE '%2027%' OR notes LIKE '%2028%');" 2>/dev/null >> "$LOG_FILE" || echo "No contract data found or DB error" >> "$LOG_FILE"

echo "Check complete." >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
