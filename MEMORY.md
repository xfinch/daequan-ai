# Long-Term Memory — Daequan

## ⚠️ SECURITY PRINCIPLES

### NO KEYS IN REPOS — EVER
- **All credentials must be stored in:** macOS Keychain, environment variables, or secure vaults
- **Never commit:** API keys, tokens, passwords, secrets to any git repository
- **If exposed:** Rotate immediately, scrub from git history (git-filter-repo or BFG)
- **Current status:** ⚠️ KEYS EXPOSED — rotation required

### REMOTE-ONLY ACCESS — DESIGN FOR AUTONOMY
**Principle:** The system must operate without requiring local authentication to the Mac mini.

**Problem:** macOS Keychain requires local user authentication (Touch ID, password), which blocks remote operation when Xavier is not physically present.

**Solution Approaches:**
1. **Environment variables** loaded at startup (no interactive auth required)
2. **Encrypted files** with keys stored in memory (session-only, not disk)
3. **Cloud-based secrets** (AWS Secrets Manager, 1Password CLI, etc.)
4. **Pre-authenticated sessions** that persist without keychain access

**Key constraint:** Must maintain "no keys in repos" while enabling fully remote operation.

---

## Active Projects

### The Traffic Link (TTL)
**Role:** Business consultancy operations and infrastructure

**Key Systems:**
- GHL Sub-account: mhvGjZGZPcsK3vgjEDwI (token: [KEYCHAIN:ghl-ttl-token])
- Telnyx: +1 (253) 999-9067 for SMS ([KEYCHAIN:telnyx-api-key])
- WhatsApp Business: +1 (253) 367-6245 (US Mobile eSIM)
- Cloudflare: Zone 96b4deff5c3860f7847687fabd64b81b ([KEYCHAIN:cloudflare-api-token])

**Active Client:**
- Trina Fallardo — cold email campaign (warming up, launch ~1 week)

### Plaud Webhook Integration — ACTIVE (2026-02-22)
**Role:** Voice memo transcription routing to 3 buckets (PERSONAL, TTL, COMCAST)

**URL:** `https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook`
**Tunnel:** Tailscale funnel on port 3456

**3-Bucket Routing:**
- **PERSONAL:** iCloud Reminders + iMessage to +18176966645
- **TTL:** GHL contact notes + tasks (if actionable)
- **COMCAST:** MongoDB CRM notes + package extraction (triple play, etc.)

**Classification:** Hybrid (keywords at start/end override AI)
**Keywords:** `PERSONAL`, `TTL`, `COMCAST`

**Zapier Config:**
- URL: `https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook`
- Headers: `X-Zapier-Signature: xavier_webhook_a893b07804f25caa`
- Payload: `{transcription, summary, recording_id, timestamp}`

**Files:**
- `plaud-webhook/server.js` — Webhook endpoint
- `plaud-webhook/classifier.js` — Keyword + AI classification
- `plaud-webhook/actions/` — PERSONAL, TTL, COMCAST handlers

---

### Comcast CRM System — ACTIVE (2026-02-26)
**Role:** Xavier's sales territory management and lead tracking

**Key Systems:**
- **Web Map:** https://daequanai.com/comcast — Interactive territory map with visit pins
- **Database:** MongoDB with audit logging (ChangeLog schema)
- **GHL Sub-account:** Comcast - Xavier, Location ID: `nPubo6INanVq94ovAQNW`
- **GHL Domain:** White-labeled at app.thetraffic.link

**Recent Fixes (2026-02-26):**
- Fixed Leaflet SSR issues causing "client-side exception" errors
- Added geolocation: user position, closest ZIP detection, territory status
- Fixed logout redirect to prevent 404 errors

**Map Features:**
- **Geolocation:** Shows user position, nearest ZIP, in/out of territory status
- **Visit Pins:** Color-coded by status (interested, follow-up, not-interested, called, customer)
- **Territory Boundaries:** 14 ZIP codes displayed with approximate radius circles
- **Mobile Responsive:** Works on phone with tap-to-add pins

**Active Prospects (2026-02-26):**
- **Proctor District (98407):** Knapp's Restaurant (Billy), MQF (Shawn), Rudy's (Sarah), Proctor Mercantile (Anya Evans)
- **Outside Territory:** Logic Staffing (Sumner), GreenHaven Interactive (Tacoma 98424)

**Files:**
- `app/comcast/page.tsx` — Next.js map component
- `app/api/visits/route.ts` — Visit CRUD API
- `kanban-partners.md` — Partner pipeline tracking

---

### Partners Pipeline — NEW (2026-02-26)
**Role:** Track referral partners (paid and non-paid) for Comcast

**Partner Types:**
- **Non-Paid Partners:** Referral sources who connect people professionally (no commission)
- **Paid Partners:** Signed Comcast affiliates earning up to $10K/year commission

**Current Prospects:**
- **Vance Richardson** (Logic Staffing) — Former Comcast BAE, IT network referrals
- **Tara Groody** (GreenHaven Interactive) — Client Success Manager, connects people professionally

**Scheduled Meetings:**
- Monday 2nd, 2 PM: Vance at Point Ruston (next to WildFin)
- Tuesday 11:30 AM: Tara at 512 Pacific Hwy, Lakewood

**File:** `kanban-partners.md`

---

## Infrastructure Decisions

### 2026-02-18: Kanban Structure
**Principle:** Internal projects and client work must live on separate swimlanes.
- Internal = tools, automation, infrastructure (not billable)
- Client = deliverables, active engagements (billable)

### 2026-02-18: Email Monitoring Approach
**Decision:** Use Himalaya (IMAP) over GHL two-way for xavier@thetraffic.link
**Rationale:** Better programmatic filtering, proactive alerts, full control over organization

---

## Credentials & Access

### Environment Variables (launchd)
**Location:** `~/Library/LaunchAgents/ai.daequan.environment.plist`

**Purpose:** Stores all API tokens as environment variables for remote operation without Keychain authentication.

**To update:**
```bash
# Edit the plist
nano ~/Library/LaunchAgents/ai.daequan.environment.plist

# After editing, reload:
launchctl unload ~/Library/LaunchAgents/ai.daequan.environment.plist
launchctl load ~/Library/LaunchAgents/ai.daequan.environment.plist

# Verify loaded:
launchctl getenv GITHUB_TOKEN
```

**Current variables:**
- `GITHUB_TOKEN` — GitHub API
- `GHL_TTL_TOKEN` — GHL TTL sub-account
- `RAILWAY_CLIENT_ID` — Railway OAuth (rlwy_oaci_bURelhmjTLEn8hGLAQ8CXTny)
- `RAILWAY_CLIENT_SECRET` — Railway OAuth secret (rlwy_oacs_...)
- `GHL_AGENCY_TOKEN` — GHL agency-level
- `TELNYX_API_KEY` — Telnyx SMS
- `CLOUDFLARE_API_TOKEN` — Cloudflare
- `PRIVATEEMAIL_PASSWORD` — xavier@thetraffic.link
- `PLAUD_WEBHOOK_SECRET` — Plaud webhook auth (xavier_webhook_a893b07804f25caa)
- `OPENAI_API_KEY` — OpenAI API access (GPT-4o, o1, etc.)

**Stored in macOS Keychain (legacy):**
- `github-dashboard-token` — xfinch/kanban
- `ghl-ttl-token` — TTL sub-account API
- `ghl-agency-token` — Agency-level API
- `telnyx-api-key` — Telnyx API
- `cloudflare-api-token` — Cloudflare
- `privateemail-xavier` — xavier@thetraffic.link (pending)

---

## Xavier Preferences

- **Name:** Xavier (not "X" or other variants)
- **Timezone:** America/Los_Angeles (PST)
- **Role:** Ideator/imagineer — generates vision and direction
- **Communication:** Professional, polished, business-oriented
- **Current focus:** Building infrastructure for TTL while ramping Comcast income

---

## Our Dynamic

- Xavier imagines, I execute
- My authority: task assignment, skill assessment, skill building, MCP development, results delivery
- When uncertain: ask before external actions (emails, posts, anything public)

---

## Session Startup

**User preference:** On session start, report "hey Xavier, I'm up to speed" after reading context files.

This signals:
- I've read BOOTSTRAP.md, SOUL.md, USER.md
- I've checked memory files for today and yesterday
- I'm ready to execute

---

*Updated: 2026-02-26*
