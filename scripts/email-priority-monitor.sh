#!/bin/bash
# Priority Email Monitor for Xavier
# Run via heartbeat to surface important emails with tiered alerts

set -e

# Priority Configuration
P0_KEYWORDS=("URGENT" "CRITICAL" "DOWN" "BROKEN" "EMERGENCY" "ASAP" "IMMEDIATE" "CRISIS")
P1_KEYWORDS=("Re:" "RE:")  # Client replies are high priority
P1_DOMAINS=("gmail.com" "outlook.com" "yahoo.com" "icloud.com")  # Common client domains
P2_DOMAINS=("thetraffic.link")  # Internal/project

# Known client emails from GHL (last sync)
KNOWN_CLIENTS=("kristitrealestate@gmail.com" "clearbooksbytrina@gmail.com" "chris@fondi.com" "james@smartpnw.com")

# Check functions
function check_p0_emergency() {
    echo "🔴 CHECKING P0 EMERGENCIES..."
    local found=0
    for keyword in "${P0_KEYWORDS[@]}"; do
        local results=$(himalaya envelope list subject:"$keyword" --page-size 3 2>/dev/null | grep "^[0-9]" || true)
        if [ -n "$results" ]; then
            echo "⚠️  P0 ALERT - Keyword: $keyword"
            echo "$results"
            found=1
        fi
    done
    
    # Check from priority senders with emergency context
    local telnyx=$(himalaya envelope list from:telnyx.com --page-size 2 2>/dev/null | grep -E "fail|error|urgent|critical" -i || true)
    if [ -n "$telnyx" ]; then
        echo "⚠️  P0 ALERT - Telnyx issue"
        echo "$telnyx"
        found=1
    fi
    
    return $found
}

function check_p1_clients() {
    echo "🟡 CHECKING P1 CLIENT EMAILS..."
    local found=0
    
    # Check recent emails (last 50)
    local recent=$(himalaya envelope list --page-size 50 2>/dev/null | grep "^[0-9]" || true)
    
    # CRITICAL: Check for replies from known clients
    for client_email in "${KNOWN_CLIENTS[@]}"; do
        local client_replies=$(echo "$recent" | grep -i "$client_email" || true)
        if [ -n "$client_replies" ]; then
            echo "🚨 P1 CLIENT REPLY FROM $client_email:"
            echo "$client_replies"
            found=1
        fi
    done
    
    # Check for any "Re:" emails (potential client replies)
    local replies=$(echo "$recent" | grep -i "Re:" || true)
    if [ -n "$replies" ]; then
        echo "📧 P1 REPLIES DETECTED:"
        echo "$replies"
        found=1
    fi
    
    # Check emails with question marks (client questions)
    local questions=$(echo "$recent" | grep -E '\?' || true)
    if [ -n "$questions" ]; then
        echo "📧 P1 CLIENT QUESTIONS:"
        echo "$questions"
        found=1
    fi
    
    return $found
}

function check_p2_updates() {
    echo "🔵 CHECKING P2 PROJECT UPDATES..."
    local found=0
    
    # Check for status/progress/update keywords
    local updates=$(himalaya envelope list subject:"status" OR subject:"update" OR subject:"progress" --page-size 5 2>/dev/null | grep "^[0-9]" || true)
    if [ -n "$updates" ]; then
        echo "📋 P2 PROJECT UPDATES:"
        echo "$updates"
        found=1
    fi
    
    return $found
}

function summarize_p3_routine() {
    echo "⚪ P3 ROUTINE SUMMARY..."
    local count=$(himalaya envelope list --page-size 50 2>/dev/null | grep -c "^[0-9]" || echo "0")
    echo "📊 Total emails in inbox: $count"
    
    # Count unread
    local unread=$(himalaya envelope list --page-size 50 2>/dev/null | grep "|  \*" | wc -l || echo "0")
    echo "📧 Unread emails: $unread"
}

# Main execution
echo "=== Priority Email Scan: $(date) ==="
echo ""

P0_FOUND=0
P1_FOUND=0
P2_FOUND=0

if check_p0_emergency; then
    P0_FOUND=0  # Function returns 0 if no emergencies found
else
    P0_FOUND=1  # Function returns 1 if emergencies found
fi

echo ""

if check_p1_clients; then
    P1_FOUND=0
else
    P1_FOUND=1
fi

echo ""

if check_p2_updates; then
    P2_FOUND=0
else
    P2_FOUND=1
fi

echo ""

summarize_p3_routine

echo ""
echo "=== Scan complete ==="

# Output priority level for automation
if [ $P0_FOUND -eq 1 ]; then
    echo "PRIORITY:P0"
    exit 10
elif [ $P1_FOUND -eq 1 ]; then
    echo "PRIORITY:P1"
    exit 11
elif [ $P2_FOUND -eq 1 ]; then
    echo "PRIORITY:P2"
    exit 12
else
    echo "PRIORITY:P3"
    exit 0
fi
