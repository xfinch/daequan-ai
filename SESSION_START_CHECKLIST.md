# Session Start Checklist — For Daequan

_Read this BEFORE claiming something is broken or unavailable._

## Quick Verification Commands

Run these before saying "I can't..." or "It's not working":

### Email (Himalaya)
```bash
himalaya account list
```
- If it returns accounts: ✅ You CAN send email
- If error: Check configuration

### GHL API Access
```bash
launchctl getenv GHL_COMCAST_TOKEN | head -c 20
curl -s "https://services.leadconnectorhq.com/contacts/?locationId=nPubo6INanVq94ovAQNW&limit=1" \
  -H "Authorization: Bearer $(launchctl getenv GHL_COMCAST_TOKEN)" \
  -H "Version: 2021-04-15" | jq -r '.contacts[0].firstName'
```
- If returns name: ✅ GHL API is working
- If error: Token issue or API down

### SQLite Database
```bash
cd /Users/xfinch/.openclaw/workspace/comcast-crm
sqlite3 comcast.db "SELECT COUNT(*) FROM business_visits;"
```
- If returns number: ✅ Database accessible
- If error: Check file exists, permissions

### Recent Session Context
```bash
ls -lt /Users/xfinch/.openclaw/workspace/memory/*.md | head -3
```
- Check today's and yesterday's memory files for context

## Before Claiming "X is Broken"

1. **Check DAEQUAN_STATE.md** — Did I already solve this?
2. **Check MEMORY.md** — Is this documented?
3. **Check TOOLS.md** — Is there a skill for this?
4. **Run quick test** — Actually verify it's broken
5. **Check if it's a sync issue** — GHL vs SQLite mismatch?

## Common False Alarms

| Claim | Reality | Quick Check |
|-------|---------|-------------|
| "I can't send email" | Himalaya is configured | `himalaya account list` |
| "GHL isn't working" | Token is valid | `launchctl getenv GHL_COMCAST_TOKEN` |
| "No contacts today" | They're in GHL, not SQLite | Check both sources |
| "I don't have context" | Read memory files | `memory/YYYY-MM-DD.md` |

## What I Should Already Know

Don't ask, just use:
- Xavier's contact info (title, phone, email)
- GHL Location IDs (Comcast & TTL)
- Partner pipeline file location
- Primary communication channel (WhatsApp)
- Timezone (America/Los_Angeles)

## Active Reminders

Check these at session start:
- Any cron jobs pending?
- Any sub-agents running?
- Any follow-ups due (Kristen Morkert — Tuesday)?

## If Something Is Actually Broken

1. Verify it's broken (run test)
2. Check DAEQUAN_STATE.md for known issues
3. Document in DAEQUAN_STATE.md under "Recent Failures"
4. Fix or delegate
5. Update DAEQUAN_STATE.md when resolved

---

*Stop. Read this. Check before claiming ignorance.*
