# Daequan State — My Capabilities & Patterns

_Last Updated: 2026-06-04_

## Verified Working Tools

### Email (Himalaya)
- **Status:** ✅ Configured and working
- **Account:** thetrafficlink (IMAP + SMTP)
- **Commands:** `himalaya message write`, `himalaya template send`
- **Last Used:** 2026-06-04 (sent email to comcast.xavier@gmail.com)
- **Note:** Don't claim "I can't send email" — I have this!

### GHL API
- **Status:** ✅ Working (direct API calls)
- **Tokens:** GHL_COMCAST_TOKEN, GHL_TTL_TOKEN (via launchctl)
- **Location IDs:** 
  - Comcast: nPubo6INanVq94ovAQNW
  - TTL: mhvGjZGZPcsK3vgjEDwI
- **Working Endpoints:** Contacts, notes, custom fields
- **Last Used:** 2026-06-04 (created 5 contacts + Visit Context field)

### SQLite (comcast-crm)
- **Status:** ⚠️ Partially working
- **Database:** /Users/xfinch/.openclaw/workspace/comcast-crm/comcast.db
- **Tables:** business_visits, sync_log, ghl_field_mapping
- **Issue:** GHL → SQLite sync is BROKEN (exports page can't see new contacts)
- **Workaround:** Direct GHL API works, but exports page is blind

### Image Analysis
- **Status:** ✅ Working
- **Used for:** OCR on business cards, document analysis
- **Last Used:** 2026-06-04 (processed 4 business cards)

### Cron Jobs
- **Status:** ⚠️ Unclear
- **Claimed:** 6 PM daily sync for exports
- **Reality:** Not working (contacts not syncing to SQLite)
- **Action Needed:** Verify cron is actually running

## Recent Failures (Learn From These)

### 2026-06-04: Forgot Himalaya was configured
- **What I said:** "I don't have email sending configured"
- **Reality:** Himalaya was set up and working
- **Root cause:** Didn't check before claiming ignorance
- **Fix:** Run `himalaya account list` before saying I can't send email

### 2026-06-04: Exports page not seeing new contacts
- **Symptom:** "No contacts found for today" when 5 contacts exist in GHL
- **Root cause:** GHL → SQLite sync not working
- **Impact:** Exports page is useless for today's work
- **Status:** Sub-agent investigating

### 2026-06-04: Wrong contact info for Xavier
- **Had:** Generic placeholder info
- **Should have:** Sr. Business Account Executive, 360-999-8793, xavier_finch@comcast.com
- **Fix:** Always verify contact details before creating templates

## Patterns to Avoid

1. **"I can't do X" without checking first**
   - Check TOOLS.md, DAEQUAN_STATE.md, or run a quick test
   - Better: "Let me verify if X is configured"

2. **Assuming sync works**
   - GHL and SQLite are NOT automatically synced
   - Verify data exists where the consumer expects it

3. **Creating workarounds instead of fixing root causes**
   - Don't just save files locally — fix the actual integration

## Session Start Verification Checklist

Before claiming something is broken:
- [ ] Check DAEQUAN_STATE.md (this file)
- [ ] Check TOOLS.md for skill documentation
- [ ] Run quick test: `himalaya account list`, `launchctl getenv GHL_COMCAST_TOKEN`
- [ ] Check if issue is in MEMORY.md or recent session logs

## Quick Commands to Remember

```bash
# Verify GHL token
launchctl getenv GHL_COMCAST_TOKEN

# Verify email
himalaya account list

# Check SQLite for contacts
cd /Users/xfinch/.openclaw/workspace/comcast-crm && sqlite3 comcast.db "SELECT * FROM business_visits ORDER BY created_at DESC LIMIT 5;"

# Check GHL contacts
curl -s "https://services.leadconnectorhq.com/contacts/?locationId=nPubo6INanVq94ovAQNW" -H "Authorization: Bearer $(launchctl getenv GHL_COMCAST_TOKEN)" -H "Version: 2021-04-15" | jq '.contacts | length'
```

## What I Should Know Without Asking

- Xavier's title: **Sr. Business Account Executive**
- Xavier's phone: **360-999-8793**
- Xavier's email: **xavier_finch@comcast.com**
- Primary channel: **WhatsApp** (Meta Ray-Ban glasses)
- Timezone: **America/Los_Angeles (PDT)**
- GHL Location IDs (Comcast & TTL)
- Partner pipeline location: `/Users/xfinch/.openclaw/workspace/kanban-partners.md`

## Active Issues (Don't Forget)

1. **Exports sync broken** — GHL contacts not appearing on exports page
2. **Sub-agent running** — fix-exports-sync task in progress
3. **Kristen Morkert follow-up** — due Tuesday (reminder set)

---

*This file is for me (Daequan) to read at session start. It tracks what I actually have working vs. what I think I have.*
