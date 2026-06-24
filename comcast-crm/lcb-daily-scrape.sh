#!/bin/bash
# LCB Daily Scrape - Runs at 9 AM daily
# Checks for new liquor licenses in Comcast territory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/lcb-data/scrape.log"
NOTIFICATION_FILE="$SCRIPT_DIR/lcb-data/notification.txt"

# Run the scraper with notification output
cd "$SCRIPT_DIR"
/opt/homebrew/bin/node scrape-lcb-new-apps.js --notify --save >> "$LOG_FILE" 2>&1

# Check if there are new businesses
if [ -f "$NOTIFICATION_FILE" ]; then
    NEW_COUNT=$(grep -c "🆕 NEW" "$NOTIFICATION_FILE" 2>/dev/null || echo "0")
    
    # Only send notification if there are new businesses
    if grep -q "NEW LCB LICENSES FOUND" "$NOTIFICATION_FILE"; then
        # Send via Telegram/WhatsApp using OpenClaw message tool
        # This will be picked up by the cron system
        echo "New LCB licenses found - check $NOTIFICATION_FILE"
    fi
fi

echo "[$(date)] LCB scrape completed" >> "$LOG_FILE"
