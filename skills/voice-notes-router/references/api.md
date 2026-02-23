# Voice Notes Router - API Reference

## Endpoints

### POST /plaud-webhook
Main webhook endpoint for receiving voice note transcriptions.

**Headers:**
- `Content-Type: application/json`
- `X-Zapier-Signature: xavier_webhook_a893b07804f25caa` (optional)

**Body:**
```json
{
  "transcription": "Full text of voice recording",
  "summary": "AI-generated summary",
  "recording_id": "plaud_12345",
  "timestamp": "2026-02-23T12:00:00Z",
  "duration": 120,
  "tags": [],
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "hash": "p-a1b2c3d",
  "bucket": "COMCAST",
  "recordingId": "plaud_12345",
  "referenceUrl": "https://.../note/p-a1b2c3d",
  "actions": { ... },
  "timing": { "routing": 45, "total": 120 }
}
```

### GET /plaud-webhook/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-23T12:00:00Z",
  "testMode": false,
  "buckets": ["PERSONAL", "TTL", "COMCAST"]
}
```

### GET /plaud-webhook/stats
Get processing statistics.

**Response:**
```json
{
  "totalProcessed": 42,
  "byBucket": { "PERSONAL": 10, "TTL": 15, "COMCAST": 17 },
  "lastProcessed": "2026-02-23T11:30:00Z"
}
```

### GET /plaud-webhook/review
Review queue HTML page for manual classification.

## Hash Format

Notes are assigned unique hashes for reference:
- Format: `p-{7-char-alphanumeric}`
- Example: `p-a1b2c3d`
- Used in URLs: `/note/p-a1b2c3d`

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Note processed and routed |
| 400 | Bad Request | Missing transcription or summary |
| 401 | Unauthorized | Invalid signature |
| 429 | Rate Limited | Too many requests from IP |
| 500 | Server Error | Internal processing error |

## Rate Limits

- 10 requests per minute per IP
- Burst allowed: 5 requests
- Window: 60 seconds
