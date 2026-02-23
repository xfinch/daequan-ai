---
name: business-card-capture
description: Extract contact information from business card images via WhatsApp OCR, validate required fields, and create GHL contacts with interactive missing-info collection. Use when: (1) Processing business card photos, (2) Creating CRM contacts from cards, (3) Extracting contact data from images, (4) Building sales lead database from physical cards.
---

# Business Card Capture

Extract, validate, and store contact information from business card images with deterministic field validation.

## Quick Start

```bash
# Process a card image manually
./process-card.js --image card.jpg --source whatsapp

# Check pending cards (missing info)
./list-pending.sh

# Complete a partial entry
./complete-entry.js --id visit_123 --field phone --value "555-1234"
```

## Required Fields

All 4 fields must be present for a **complete** entry:

| Field | Validation | Example |
|-------|------------|---------|
| **name** | Non-empty string | "John Smith" |
| **phone** | Valid phone format | "(253) 555-1234" |
| **email** | Valid email format | "john@company.com" |
| **address** | Street, city, state, zip | "123 Main St, Tacoma, WA 98404" |

## Workflow

```
User sends card photo
        ↓
OCR extracts text
        ↓
Parse into structured fields
        ↓
Check required fields
        ↓
├─ All present → Create GHL contact + MongoDB + Geocode → ✅ Complete
└─ Missing fields → Create partial → Ask user → Update → Check again
```

## Interactive Missing Info

When fields are missing:

1. **Map shows:** "⚠️ Needs Update" badge
2. **GHL gets tags:** `missing-phone`, `missing-email`, etc.
3. **WhatsApp asks:** "❓ What's the phone number?"
4. **User replies:** Raw value
5. **System updates:** Removes tag, re-checks completeness

## Usage Patterns

### From WhatsApp (Primary)
User sends photo → I OCR → Extract → Validate → Reply with status

### From CLI (Batch/Testing)
```bash
# Test OCR extraction
./process-card.js --image test-card.jpg --dry-run

# Process with known missing fields
./process-card.js --image card.jpg --missing phone,email
```

### From OpenClaw Session
```
Process this business card: [image]
→ I extract text
→ "Found: Name, Phone | Missing: Email, Address"
→ "❓ What's the email address?"
```

## Output States

| State | Meaning | Action Needed |
|-------|---------|---------------|
| **complete** | All fields captured | None - GHL contact created |
| **partial** | Some fields missing | User must provide missing info |
| **failed** | OCR failed or unreadable | Retry with clearer photo |

## GHL Integration

**Tags applied:**
- `missing-{field}` - Tracks what's needed
- `needs-info` - General incomplete status
- `business-card-capture` - Source tracking

**Tasks created:**
- High priority when card received
- Due: 24 hours
- Assigned: Xavier

## References

- **OCR Engine:** See [references/ocr.md](references/ocr.md)
- **Field Parsing:** See [references/parsing.md](references/parsing.md)
- **GHL API:** See [references/ghl-integration.md](references/ghl-integration.md)

## Files

- `scripts/process-card.js` - Main processing script
- `scripts/complete-entry.js` - Complete partial entries
- `scripts/list-pending.sh` - Show incomplete cards
- `references/ocr.md` - OCR configuration
- `references/parsing.md` - Field extraction logic
- `references/ghl-integration.md` - GHL API details
