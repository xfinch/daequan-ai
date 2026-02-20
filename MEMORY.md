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
- `GHL_AGENCY_TOKEN` — GHL agency-level
- `TELNYX_API_KEY` — Telnyx SMS
- `CLOUDFLARE_API_TOKEN` — Cloudflare
- `PRIVATEEMAIL_PASSWORD` — xavier@thetraffic.link

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

*Updated: 2026-02-18*
