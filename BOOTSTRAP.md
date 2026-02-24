# BOOTSTRAP.md — OpenClaw Session Startup Reference

**Purpose:** Critical context that persists across sessions. Read this on every boot.

---

## 🚨 TOP-LEVEL PRIORITIES (Never Forget)

### 1. SECURITY: NO KEYS IN REPOS — EVER
- **Rule:** All credentials stored in macOS Keychain or env vars ONLY
- **Violation consequence:** Immediate key rotation required
- **Keychain entries to maintain:**
  - `github-dashboard-token`
  - `ghl-ttl-token`
  - `ghl-agency-token`
  - `telnyx-api-key`
  - `cloudflare-api-token`
  - `privateemail-xavier`
  - `railway-client-secret`

### 2. GIT REPOSITORIES

| Repo | Path | Remote | Purpose |
|------|------|--------|---------|
| `workspace` | `/Users/xfinch/.openclaw/workspace/` | `github.com/xfinch/workspace` | Main OpenClaw workspace |
| `kanban` | `/Users/xfinch/.openclaw/workspace/dashboard/` | `github.com/xfinch/kanban` | Visual kanban board |

**⚠️ CRITICAL:** Main workspace has NO remote. Changes committed but not pushed.

### 3. ACTIVE PROJECTS (Always Track)

| Project | Type | Status | Owner |
|---------|------|--------|-------|
| **TTL** | Business | 🟢 Active | Xavier/Daequan |
| **Comcast** | Employment | 🟢 Active | Xavier |
| **Personal** | Life | ⚪ Background | Xavier |

---

## 📁 MEMORY STRUCTURE

```
memory/
├── MEMORY.md              ← Long-term curated memory
├── global/                ← Daily logs, cross-project
│   └── 2026-02-18.md
├── ttl/                   ← The Traffic Link
├── comcast/               ← Day job
├── personal/              ← Life admin
└── dashboard/             ← Kanban project
```

---

## 🔧 INFRASTRUCTURE SNAPSHOT

### Key Systems
- **GHL Sub-account:** mhvGjZGZPcsK3vgjEDwI
- **Telnyx SMS:** +1 (253) 999-9067
- **WhatsApp Business:** +1 (253) 367-6245
- **Email:** xavier@thetraffic.link (Namecheap PrivateEmail)
- **Cloudflare Zone:** 96b4deff5c3860f7847687fabd64b81b

### Active Clients
- Trina Fallardo — Cold email campaign (warming up, ~1 week to launch)

---

## 📋 CURRENT BLOCKERS

| Issue | Blocking | Since |
|-------|----------|-------|
| Telnyx API v2 key | Voice Coaching System | 2026-02-16 |

---

## 🎯 DECISIONS IN EFFECT

1. **Kanban Structure:** Internal vs Client swimlanes (2026-02-18)
2. **Email Monitoring:** Himalaya (IMAP) over GHL two-way (2026-02-18)
3. **Security:** Keychain-only credentials, no keys in repos (2026-02-18)

---

## ⚡ IMMEDIATE ACTIONS (If Nothing Else)

On every session start:
1. ✅ Verify no keys visible in any `.md` files
2. ✅ Check `kanban-ttl.md` for active work
3. ✅ Review `memory/global/` for recent context
4. ✅ Confirm keychain has required credentials

---

*Last Updated: 2026-02-18*  
*This file is read on every OpenClaw startup. Keep it current.*
