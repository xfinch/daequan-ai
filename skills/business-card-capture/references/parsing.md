# Business Card Capture - Field Parsing

## Name Parsing

### Patterns Detected
- `First Last` → "John Smith"
- `First M. Last` → "John M. Smith"
- `First Middle Last` → "John Michael Smith"
- Business name before/after person name

### Business Name Detection
- All caps sections
- Words ending in: Inc, LLC, Ltd, Co, Company
- Lines at top of card

## Phone Number Parsing

### Formats Accepted
```
(253) 555-1234
253-555-1234
253.555.1234
253 555 1234
+1 (253) 555-1234
```

### Phone Type Detection
- **Mobile:** Often labeled "Cell", "Mobile"
- **Office:** Labeled "Office", "Direct"
- **Fax:** Labeled "Fax" (stored separately)

## Email Parsing

### Validation
- Must contain `@`
- Must have domain after `@`
- Must have TLD (.com, .net, etc.)

### Common Corrections
- `user@company,com` → `user@company.com`
- `user@company` → Prompt for domain
- OCR errors: `0` vs `O`, `1` vs `l`, `5` vs `S`

## Address Parsing

### Street Address
```
123 Main Street
456 Oak Ave, Suite 100
789 Pine Road #200
```

### City/State/Zip Extraction

**Common formats:**
```
Tacoma, WA 98404
Tacoma WA 98404
Tacoma, Washington 98404
Tacoma WA
```

**Parsed into:**
```json
{
  "city": "Tacoma",
  "state": "WA",
  "zip": "98404"
}
```

### Default Values (if missing)
- City: "Tacoma"
- State: "WA"
- Zip: "98404"

## Missing Field Handling

When required fields are missing:

1. **Create partial record** in MongoDB
2. **Tag in GHL:** `missing-{field}`, `needs-info`
3. **Ask user via WhatsApp:** "❓ What's the phone number?"
4. **Show on map:** "⚠️ Needs Update" badge

### Interactive Collection Flow

```
User: [sends card photo]
System: "📇 Found: Mike Johnson, (253) 555-1234
        Missing: Email, Full address
        ❓ What's the email address?"

User: "mike@mikesplumbing.com"
System: "✅ Email added. ❓ What's the street address?"

User: "123 Main St"
System: "✅ Address added. 
        📍 Visit marked complete!
        View on map: https://..."
```

## Validation Rules

| Field | Required | Validation |
|-------|----------|------------|
| name | ✓ | Non-empty, not "Unknown" |
| phone | ✓ | Valid US phone format |
| email | ✓ | Valid email format |
| address.street | ✓ | Non-empty, includes number |
| address.city | ✓ | Non-empty |
| address.state | ✓ | 2-letter code |
| address.zip | ✓ | 5 digits |
