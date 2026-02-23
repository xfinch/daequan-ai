---
name: voice-notes-router
description: Route voice note transcriptions to PERSONAL, TTL, or COMCAST buckets with AI classification and webhook processing. Use when: (1) Processing Plaud voice memos, (2) Classifying voice notes by business context, (3) Creating CRM entries from voice data, (4) Routing audio transcriptions to appropriate systems.
---

# Voice Notes Router

Process voice note transcriptions and route them to the correct business bucket with deterministic classification.

## Quick Start

```bash
# Process a voice note manually
./process-voice-note.js --file recording.txt --source plaud

# Check recent notes
./list-recent.sh --limit 10

# Review unmatched COMCAST notes
open https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook/review
```

## Buckets

| Bucket | Destination | Use Case |
|--------|-------------|----------|
| **PERSONAL** | iCloud Reminders + iMessage | Private tasks, personal notes |
| **TTL** | GHL contact notes + tasks | Business consultancy work |
| **COMCAST** | MongoDB CRM + review queue | Sales territory management |

## Classification Rules

### Priority 1: Keyword Override (Deterministic)
Check first/last 3 words of transcription:
- `PERSONAL` → PERSONAL bucket
- `TTL` → TTL bucket  
- `COMCAST` → COMCAST bucket

### Priority 2: AI Classification
If no keyword match, use OpenAI to classify based on content patterns.

## Usage Patterns

### From Webhook (Automated)
Plaud → Zapier → `POST /plaud-webhook` → Classify → Route → Confirm

### From CLI (Manual)
```bash
# Test classification without saving
./classify-test.js "COMCAST visited Tony's Pizza, hot lead"

# Process and route
./process-voice-note.js --text "TTL follow up with Trina about campaign" --dry-run
```

### From OpenClaw Session
```
Process this voice note: "Visited Federal Way Auto, manager wants gigabit"
→ I classify → Route to COMCAST → Create CRM entry
```

## Output Format

Every processed note generates:
```json
{
  "hash": "p-a1b2c3d",
  "bucket": "COMCAST",
  "recordingId": "plaud_12345",
  "referenceUrl": "https://.../note/p-a1b2c3d",
  "actions": { /* bucket-specific results */ },
  "queuedForReview": false
}
```

## Review Queue

COMCAST notes without matching contacts go to manual review:
- **URL:** https://xaviers-mac-mini.tailc89dd8.ts.net/plaud-webhook/review
- **Auto-matches:** Suggests similar businesses
- **Manual assign:** Link note to correct business
- **Dismiss:** Remove from queue

## References

- **API Details:** See [references/api.md](references/api.md)
- **Classification Logic:** See [references/classification.md](references/classification.md)
- **Bucket Handlers:** See [references/handlers.md](references/handlers.md)

## Files

- `scripts/process-voice-note.js` - CLI processing script
- `scripts/classify-test.js` - Test classification
- `scripts/list-recent.sh` - List recent notes
- `references/api.md` - API endpoint documentation
- `references/classification.md` - Classification algorithm details
- `references/handlers.md` - Bucket action handlers
