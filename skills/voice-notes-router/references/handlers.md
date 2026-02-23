# Voice Notes Router - Bucket Handlers

## PERSONAL Handler

**File:** `actions/personal.js`

### Actions
1. Create iCloud Reminder (if actionable)
2. Send iMessage summary to +18176966645
3. Store in memory file

### Output Format
```json
{
  "bucket": "PERSONAL",
  "reminder": {
    "created": true,
    "title": "Call mom",
    "due": "2026-02-24T10:00:00Z"
  },
  "message": {
    "sent": true,
    "to": "+18176966645",
    "preview": "Personal note: Call mom tomorrow"
  },
  "memory": {
    "filename": "memory/personal/2026-02-23.md",
    "entryId": "note_abc123"
  }
}
```

## TTL Handler

**File:** `actions/ttl.js`

### Actions
1. Search GHL for mentioned contact
2. Add note to contact record
3. Create task if actionable
4. Log to TTL memory

### Output Format
```json
{
  "bucket": "TTL",
  "contact": {
    "found": true,
    "id": "abc123",
    "name": "Trina Fallardo"
  },
  "note": {
    "added": true,
    "id": "note_def456"
  },
  "task": {
    "created": true,
    "id": "task_ghi789",
    "title": "Follow up with Trina about campaign"
  }
}
```

### GHL Note Format
```
🎙️ Voice Note - {timestamp}

{summary}

---
Full transcription:
{transcription}

Reference: {hash}
```

## COMCAST Handler

**File:** `actions/comcast.js`

### Actions
1. Extract business name from transcription
2. Search MongoDB for matching visit
3. If match found → Add note to visit
4. If no match → Queue for review

### Output Format (Match Found)
```json
{
  "bucket": "COMCAST",
  "contact": {
    "found": true,
    "visitId": "visit_abc123",
    "businessName": "Tony's Pizza"
  },
  "note": {
    "added": true,
    "packages": ["triple play"],
    "interestLevel": "hot"
  }
}
```

### Output Format (No Match)
```json
{
  "bucket": "COMCAST",
  "contact": {
    "found": false
  },
  "queuedForReview": true,
  "reviewId": "review_xyz789",
  "potentialMatches": [
    { "visitId": "visit_abc", "businessName": "Tony's Pizza", "score": 0.85 }
  ]
}
```

## Review Queue

**File:** `review-queue.js`

When COMCAST notes can't be auto-matched:
1. Added to `data/note-review-queue.json`
2. Available at `/plaud-webhook/review`
3. Admin can assign to business or dismiss

### Review States
- `pending` - Awaiting manual assignment
- `assigned` - Linked to business
- `dismissed` - Ignored (spam, irrelevant)

## Error Handling

Each handler includes try/catch with fallback:
- GHL unavailable → Queue locally, retry later
- MongoDB error → Log to file, alert admin
- iMessage fail → Fallback to console log
