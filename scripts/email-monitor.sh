#!/bin/bash
# Himalaya Email Monitor for Xavier
# Run via cron or heartbeat to surface important emails

set -e

# Configuration
INBOX_THRESHOLD=5  # Alert if more than this many unread
IMPORTANT_SENDERS=(
    "telnyx.com"
    "github.com"
    "thetraffic.link"
    "skool.com"
)
IMPORTANT_KEYWORDS=(
    "proposal"
    "contract"
    "invoice"
    "payment"
    "meeting"
    "urgent"
    "action required"
)

echo "=== Email Check: $(date) ==="
echo ""

# Check for unread emails (flagged with *)
echo "📧 Recent unread emails:"
himalaya envelope list --page-size 20 2>/dev/null | grep -E "^\| [0-9]+ \|  \*" | head -10 || echo "  None found"
echo ""

# Search for important sender domains
echo "🔔 Emails from priority senders:"
for sender in "${IMPORTANT_SENDERS[@]}"; do
    himalaya envelope list from:$sender --page-size 5 2>/dev/null | tail -n +3 | head -5 || true
done
echo ""

# Search for actionable keywords
echo "⚡ Potentially actionable emails:"
for keyword in "${IMPORTANT_KEYWORDS[@]}"; do
    himalaya envelope list subject:$keyword --page-size 3 2>/dev/null | tail -n +3 | head -3 || true
done
echo ""

echo "=== Check complete ==="
