#!/bin/bash
# Integrated Email Alert System
# Handles priority detection → GHL task creation → Kanban updates

SCRIPT_DIR="/Users/xfinch/.openclaw/workspace/scripts"
RESULT=$($SCRIPT_DIR/email-priority-monitor.sh 2>&1)
EXIT_CODE=$?

# Parse results
echo "$RESULT"

case $EXIT_CODE in
    10)
        echo ""
        echo "🚨 P0 EMERGENCY DETECTED"
        echo "Creating GHL urgent task..."
        # Extract first P0 email and create task
        P0_EMAIL=$(echo "$RESULT" | grep -A1 "P0 ALERT" | tail -1)
        $SCRIPT_DIR/ghl-create-task.sh "P0" "Emergency Email Alert" "$P0_EMAIL"
        # TODO: Trigger LC app notification via GHL
        ;;
    11)
        echo ""
        echo "⚡ P1 CLIENT QUESTION DETECTED"
        echo "Creating GHL task (10min SLA)..."
        P1_EMAIL=$(echo "$RESULT" | grep -A1 "P1" | tail -1)
        $SCRIPT_DIR/ghl-create-task.sh "P1" "Client Question - Quick Response Needed" "$P1_EMAIL"
        # Flag for kanban update if project-related
        ;;
    12)
        echo ""
        echo "📋 P2 PROJECT UPDATE DETECTED"
        echo "Creating GHL task (2hr SLA)..."
        P2_EMAIL=$(echo "$RESULT" | grep -A1 "P2" | tail -1)
        $SCRIPT_DIR/ghl-create-task.sh "P2" "Project Update" "$P2_EMAIL"
        ;;
    *)
        echo ""
        echo "✅ No priority emails found"
        ;;
esac
