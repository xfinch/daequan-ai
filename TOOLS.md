# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## ⚠️ SECURITY: ALL KEYS STORED IN KEYCHAIN
See macOS Keychain for actual credential values. No keys in this file.

---

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

**Agency Token** (multi-location management)
- Token: `[KEYCHAIN:ghl-agency-token]`
- Use for: Creating/managing sub-accounts, agency-wide reports

**Sub-account Token** (business operations)
- Token: `[KEYCHAIN:ghl-ttl-token]`
- Use for: Sending emails, SMS, managing contacts, workflows
- This is the primary token for day-to-day client comms

**Location ID:** `mhvGjZGZPcsK3vgjEDwI` (TTL sub-account)

**API Base:** https://services.leadconnectorhq.com
**Docs:** https://marketplace.gohighlevel.com/docs/
