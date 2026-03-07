#!/bin/bash
# Plaud Webhook Health Monitor
# Runs every 5 minutes via cron, restarts if unhealthy

WEBHOOK_URL="https://xaviers-mac-mini.tailc89dd8.ts.net/plaud/plaud-webhook/health"
LOG_FILE="/Users/xfinch/.openclaw/workspace/plaud-webhook/logs/health.log"
SERVER_DIR="/Users/xfinch/.openclaw/workspace/plaud-webhook"

# Check health
HEALTH=$(curl -s --max-time 10 "$WEBHOOK_URL" 2>/dev/null)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo "[$TIMESTAMP] ✅ Healthy" >> "$LOG_FILE"
    exit 0
fi

# Not healthy - restart
echo "[$TIMESTAMP] ❌ Unhealthy, restarting..." >> "$LOG_FILE"

# Kill existing process
pkill -f "node server.js" 2>/dev/null
sleep 2

# Restart
cd "$SERVER_DIR" && nohup /opt/homebrew/bin/node server.js > logs/server.log 2>&1 &
sleep 5

# Verify restart
NEW_HEALTH=$(curl -s --max-time 10 "$WEBHOOK_URL" 2>/dev/null)
if echo "$NEW_HEALTH" | grep -q '"status":"healthy"'; then
    echo "[$TIMESTAMP] ✅ Restarted successfully" >> "$LOG_FILE"
    # Optional: notify via WhatsApp
    # curl -X POST ...
else
    echo "[$TIMESTAMP] ❌❌ Restart failed!" >> "$LOG_FILE"
fi