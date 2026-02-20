#!/bin/bash
# Comcast CRM API Tunnel Monitor
# Logs all tunnel activity and alerts on errors

LOG_DIR="/Users/xfinch/.openclaw/workspace/comcast-crm/logs"
mkdir -p "$LOG_DIR"

TUNNEL_LOG="$LOG_DIR/tunnel.log"
ACCESS_LOG="$LOG_DIR/access.log"
ERROR_LOG="$LOG_DIR/error.log"
ALERT_LOG="$LOG_DIR/alerts.log"

# Timestamp function
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Alert function - logs and can be extended to send notifications
alert() {
    local level=$1
    local message=$2
    echo "[$(timestamp)] [$level] $message" | tee -a "$ALERT_LOG"
    
    # Could add: send to WhatsApp, email, etc.
    if [ "$level" = "CRITICAL" ]; then
        echo "🚨 CRITICAL: $message" >&2
    fi
}

# Start tunnel with monitoring
start_tunnel() {
    local token=$1
    
    alert "INFO" "Starting Cloudflare tunnel..."
    
    # Run tunnel with detailed logging
    cloudflared tunnel run --token "$token" \
        --log-level info \
        --logfile "$TUNNEL_LOG" \
        2>&1 | while read line; do
            echo "[$(timestamp)] $line" >> "$TUNNEL_LOG"
            
            # Check for errors
            if echo "$line" | grep -qi "error\|fail\|disconnect"; then
                alert "ERROR" "Tunnel issue: $line"
            fi
            
            # Log connection events
            if echo "$line" | grep -qi "connected\|registered"; then
                alert "INFO" "Tunnel connected successfully"
            fi
        done &
    
    TUNNEL_PID=$!
    echo $TUNNEL_PID > /tmp/comcast_tunnel.pid
    
    alert "INFO" "Tunnel started with PID: $TUNNEL_PID"
    echo "Logs: $LOG_DIR/"
}

# Check tunnel health
check_health() {
    # Check if process is running
    if [ -f /tmp/comcast_tunnel.pid ]; then
        PID=$(cat /tmp/comcast_tunnel.pid)
        if ! ps -p "$PID" > /dev/null 2>&1; then
            alert "CRITICAL" "Tunnel process (PID: $PID) is not running!"
            return 1
        fi
    fi
    
    # Check if tunnel responds
    if ! curl -s -o /dev/null -w "%{http_code}" https://api.daequanai.com/health 2>/dev/null | grep -q "200"; then
        alert "WARNING" "Tunnel endpoint not responding (may be starting up)"
        return 1
    fi
    
    return 0
}

# Main
case "$1" in
    start)
        if [ -z "$2" ]; then
            echo "Usage: $0 start <tunnel_token>"
            exit 1
        fi
        start_tunnel "$2"
        ;;
    check)
        check_health
        ;;
    logs)
        tail -f "$TUNNEL_LOG" "$ACCESS_LOG" "$ERROR_LOG" 2>/dev/null
        ;;
    *)
        echo "Usage: $0 {start <token>|check|logs}"
        exit 1
        ;;
esac
