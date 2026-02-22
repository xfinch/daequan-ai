# PlauD.AI Integration

Voice AI call data → Zapier → OpenClaw webhook → WhatsApp notification

## Architecture

```
PlauD.AI (Voice AI calls)
    ↓
Zapier (Webhook trigger)
    ↓
OpenClaw Webhook (localhost:3456)
    ↓
OpenClaw Gateway (localhost:18789)
    ↓
Your WhatsApp (+18176966645)
```

## Setup

### 1. Start the Webhook Server

```bash
# Run manually
node /Users/xfinch/.openclaw/workspace/plaud-webhook/server.js

# Or use the launchd service (recommended)
launchctl load ~/Library/LaunchAgents/ai.daequan.plaud-webhook.plist
```

### 2. Expose to Internet (Choose one)

**Option A: Tailscale (Recommended)**
```bash
# Enable funnel on port 3456
tailscale funnel 3456
# URL: https://your-host.tailnet-name.ts.net
```

**Option B: ngrok (Quick test)**
```bash
ngrok http 3456
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Option C: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:3456
```

### 3. Configure Zapier

1. **Trigger:** PlauD.AI - New Call Completed
2. **Action:** Webhooks by Zapier - POST
   - **URL:** Your public URL (from step 2)
   - **Payload Type:** JSON
   - **Data:** Map PlauD.AI fields:
     ```json
     {
       "call_id": "{{call_id}}",
       "phone_number": "{{caller_phone}}",
       "transcript": "{{transcript}}",
       "summary": "{{ai_summary}}",
       "intent": "{{detected_intent}}",
       "entities": {
         "name": "{{extracted_name}}",
         "email": "{{extracted_email}}"
       },
       "duration_seconds": "{{duration}}",
       "outcome": "{{call_outcome}}"
     }
     ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENCLAW_GATEWAY_URL` | `http://localhost:18789` | OpenClaw gateway endpoint |
| `OPENCLAW_GATEWAY_TOKEN` | - | Gateway auth token |
| `PLAUD_DEFAULT_TARGET` | `+18176966645` | Default WhatsApp number |
| `PLAUD_WEBHOOK_PORT` | `3456` | Webhook server port |

## Payload Format

The webhook expects this JSON structure from PlauD.AI:

```json
{
  "call_id": "uuid",
  "phone_number": "+1234567890",
  "transcript": "Full conversation...",
  "summary": "AI summary...",
  "intent": "booking|inquiry|support|other",
  "entities": {
    "name": "John Doe",
    "email": "john@example.com",
    "appointment_date": "2026-02-25"
  },
  "duration_seconds": 120,
  "outcome": "completed|transferred|voicemail"
}
```

## Testing

```bash
# Send test payload
curl -X POST http://localhost:3456 \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "test-123",
    "phone_number": "+15551234567",
    "summary": "Test call from PlauD.AI",
    "intent": "inquiry",
    "entities": {"name": "Test User"},
    "duration_seconds": 60,
    "outcome": "completed"
  }'
```

## Troubleshooting

- **Webhook not receiving:** Check firewall, confirm port is open
- **Not sending to WhatsApp:** Verify `OPENCLAW_GATEWAY_TOKEN` is set
- **Zapier test fails:** Ensure public URL is accessible from internet
