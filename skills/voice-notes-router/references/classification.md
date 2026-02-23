# Voice Notes Router - Classification Algorithm

## Overview

Classification uses a two-tier system:
1. **Keyword Override** (deterministic, ~90% of cases)
2. **AI Classification** (fallback, ~10% of cases)

## Tier 1: Keyword Override

Checks first 3 words and last 3 words of transcription for bucket keywords.

### Keywords

| Bucket | Keywords | Priority |
|--------|----------|----------|
| PERSONAL | "PERSONAL", "personal" | Highest |
| TTL | "TTL", "ttl", "traffic link" | High |
| COMCAST | "COMCAST", "comcast", "Xfinity", "xfinity" | High |

### Examples

**Input:** "COMCAST visited Tony's Pizza, hot lead for triple play"
- First 3 words: ["COMCAST", "visited", "Tony's"]
- Match: "COMCAST" → COMCAST bucket ✓

**Input:** "Just a personal reminder to call mom tomorrow"
- Last 3 words: ["mom", "tomorrow", ""]
- No match → Proceed to AI classification

## Tier 2: AI Classification

Uses OpenAI GPT-4o-mini to classify when no keyword match.

### Prompt Template

```
Classify this voice note transcription into one of three buckets:
- PERSONAL: Personal life, family, errands, non-work
- TTL: The Traffic Link business, consulting clients, general business
- COMCAST: Comcast sales, territory visits, business internet/tv/phone

Transcription: {transcription}
Summary: {summary}

Respond with ONLY the bucket name: PERSONAL, TTL, or COMCAST
```

### Validation

AI response is validated against allowed buckets. If invalid:
- Default to PERSONAL
- Log warning for review

## Confidence Scoring

Each classification includes confidence:
- **Keyword match:** 100% (deterministic)
- **AI classification:** 70-95% (depends on clarity)

Low confidence (<80%) COMCAST notes are queued for manual review.

## Testing Classification

```bash
# Test with sample text
./classify-test.js "COMCAST Federal Way Auto wants gigabit"

# Expected output:
# {
#   "bucket": "COMCAST",
#   "method": "keyword",
#   "confidence": 1.0,
#   "matchedWord": "COMCAST"
# }
```
