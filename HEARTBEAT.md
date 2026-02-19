# HEARTBEAT.md

Run these checks during heartbeat polls:

## Email Priority Monitor
- Run: `/Users/xfinch/.openclaw/workspace/scripts/email-priority-monitor.sh`
- On P0 (Emergency): Alert immediately, suggest GHL notification
- On P1 (Client <10min): Create GHL task, mention in next message
- On P2 (Project <2hr): Create GHL task, kanban update if project-impacting
- On P3 (Routine): Daily summary only

## Quick Status Checks (Rotate)
1. Git status - any uncommitted changes?
2. Recent memory files - context from today/yesterday
3. Kanban TTL - active project status

## Response Logic
- P0 found: Immediate alert (don't wait for conversation)
- P1 found: Mention at next natural interaction
- P2/P3 found: Include in status summary
- Nothing found: HEARTBEAT_OK

## Priority Keywords (P0)
URGENT, CRITICAL, DOWN, BROKEN, EMERGENCY, ASAP, IMMEDIATE, CRISIS
