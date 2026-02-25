# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## ⚠️ SECURITY: ALL KEYS STORED IN PLIST
All credentials are in `~/Library/LaunchAgents/ai.daequan.environment.plist`
No keys in this file or Keychain.

---

## Google Cloud / Vertex AI

**Vertex AI Studio API Key:** `[KEYCHAIN:vertex-ai-key]`

## Railway

**OAuth Client ID:** `rlwy_oaci_bURelhmjTLEn8hGLAQ8CXTny`
**Project ID:** `abd953e3-ae34-4e5c-9a6d-8a6bff0521c8`
**Service ID:** `c8568c23-f757-4080-a596-5984d98d189f`
**Client Secret:** `[KEYCHAIN:railway-client-secret]` (if available)

## Cloudflare

**Zone ID:** `96b4deff5c3860f7847687fabd64b81b` (daequanai.com)
**Account ID:** `a12c172ad7d16e07fa7244269c089c31`
**API Token:** `[KEYCHAIN:cloudflare-api-token]`

## Telnyx

**API Key:** `[KEYCHAIN:telnyx-api-key]`
**Phone Number:** +1 (253) 999-9067
**Webhook Base:** https://sms.daequanai.com

## TTL (the traffic link) - High Level / GHL

All GHL tokens stored in `ai.daequan.environment.plist`:
- `GHL_AGENCY_TOKEN` - Multi-location management
- `GHL_TTL_TOKEN` - The Traffic Link sub-account operations
- `GHL_COMCAST_TOKEN` - Comcast sub-account operations

**Location IDs:**
- TTL: `mhvGjZGZPcsK3vgjEDwI`
- Comcast: `nPubo6INanVq94ovAQNW`

**API Base:** https://services.leadconnectorhq.com
**Docs:** https://marketplace.gohighlevel.com/docs/
