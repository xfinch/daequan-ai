# Business Card Capture - OCR Reference

## OCR Engine

**Primary:** Google Vision API (via image analysis)
**Fallback:** Local Tesseract OCR

## Input Requirements

| Format | Supported | Notes |
|--------|-----------|-------|
| JPG | ✓ | Recommended |
| PNG | ✓ | Best for high contrast |
| HEIC | ✓ | iPhone default, auto-converted |
| PDF | ✗ | Convert to image first |

## Image Quality Guidelines

For best OCR results:
- **Resolution:** Min 800x600 pixels
- **Lighting:** Even, no shadows or glare
- **Angle:** Flat, straight-on (not tilted)
- **Background:** Contrasts with card
- **Clarity:** In focus, no motion blur

## WhatsApp Processing

When user sends card photo:
1. Download image from WhatsApp
2. Convert to standard format (JPG)
3. Run OCR
4. Extract structured fields
5. Validate required fields
6. Prompt for missing info

## OCR Output Format

Raw text example:
```
MIKE'S PLUMBING
Mike Johnson, Owner
(253) 555-1234
mike@mikesplumbing.com
123 Main Street
Tacoma, WA 98404
```

## Field Extraction Mapping

| Field | Regex Patterns | Example |
|-------|----------------|---------|
| Name | Title case, near top, before/after business | "Mike Johnson" |
| Phone | `\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}` | "(253) 555-1234" |
| Email | `[\w.-]+@[\w.-]+\.\w+` | "mike@company.com" |
| Address | Number + street words | "123 Main Street" |
| City | Capitalized, before state | "Tacoma" |
| State | 2-letter code | "WA" |
| Zip | 5 digits | "98404" |

## Confidence Scoring

Each extracted field has confidence (0-100%):
- **>90%:** Auto-accept
- **70-90%:** Show to user for confirmation
- **<70%:** Mark as missing, ask user

## Testing OCR

```bash
# Test extraction on sample card
./process-card.js --image test-card.jpg --dry-run

# Expected output:
# {
#   "extracted": {
#     "name": "Mike Johnson",
#     "phone": "(253) 555-1234",
#     "email": "mike@mikesplumbing.com",
#     "address": { ... }
#   },
#   "confidence": { ... },
#   "missing": ["address.zip"]
# }
```
