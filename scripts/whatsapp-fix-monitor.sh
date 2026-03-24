#!/bin/bash
# WhatsApp Fix Monitor - Checks daily for resolution of GitHub issue #9096
# Created: 2026-03-23

ISSUE_URL="https://api.github.com/repos/openclaw/openclaw/issues/9096"
LATEST_VERSION=$(npm view openclaw version 2>/dev/null)
CACHE_FILE="$HOME/.openclaw/.whatsapp_fix_cache"
LOG_FILE="$HOME/.openclaw/logs/whatsapp-fix-monitor.log"

# Ensure log directory exists
mkdir -p "$HOME/.openclaw/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if issue is closed
ISSUE_STATE=$(curl -s "$ISSUE_URL" | grep -o '"state":"[^"]*"' | cut -d'"' -f4)

if [ "$ISSUE_STATE" = "closed" ]; then
    # Issue is closed - check if we've already notified
    if [ ! -f "$CACHE_FILE" ] || [ "$(cat "$CACHE_FILE")" != "fixed-$LATEST_VERSION" ]; then
        echo "🎉 WHATSAPP FIX DETECTED! Issue #9096 is now CLOSED."
        echo "Latest OpenClaw version: $LATEST_VERSION"
        echo "Update with: npm install -g openclaw@latest"
        echo ""
        echo "Check the release notes for WhatsApp fixes:"
        echo "https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md"
        
        # Update cache
        echo "fixed-$LATEST_VERSION" > "$CACHE_FILE"
        log "FIX DETECTED: Issue #9096 closed in version $LATEST_VERSION"
        
        # Exit with special code for cron notification
        exit 42
    fi
else
    log "Check complete: Issue still open (current version: $LATEST_VERSION)"
fi

exit 0
