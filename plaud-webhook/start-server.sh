#!/bin/bash
# Start Plaud Webhook Server on boot/login

cd /Users/xfinch/.openclaw/workspace/plaud-webhook

# Kill any existing instance
pkill -f "node server.js" 2>/dev/null
sleep 1

# Start server
nohup /opt/homebrew/bin/node server.js > logs/server.log 2>&1 &

# Wait and verify
sleep 3
HEALTH=$(curl -s --max-time 5 http://localhost:3456/plaud-webhook/health 2>/dev/null)

if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    logger "Plaud webhook started successfully"
    exit 0
else
    logger "Plaud webhook failed to start"
    exit 1
fi