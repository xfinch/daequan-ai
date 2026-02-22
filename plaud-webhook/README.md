# Plaud Webhook Integration

Voice memos from Plaud device → Zapier → Webhook → 3-bucket routing (PERSONAL / TTL / COMCAST)

## Architecture

```
Plaud Device (Voice Recording)
    ↓
Plaud AI (Transcription + Summary)
    ↓
Zapier (New Recording Trigger)
    ↓
POST https://daequanai.com/plaud-webhook
    ↓
Hybrid Classifier (Keywords → AI Fallback)
    ↓
PERSONAL / TTL / COMCAST Actions
```

## 3-Bucket Routing

| Bucket | Trigger Keywords | Actions |
|--------|------------------|---------|
| **PERSONAL** | "PERSONAL", "LIFE", "HOME", "FAMILY", "remind me", "call my", "appointment" | iCloud Reminder + iMessage + memory log |
| **TTL** | "TTL", "TRAFFIC", "CLIENT", "TRINA", "project", "proposal" | GHL contact note + task (if actionable) + memory log |
| **COMCAST** | "COMCAST", "territory", "prospect", "visit", "triple play", "internet" | MongoDB CRM note + package extraction + GHL follow-up task + memory log |

**Routing Logic:**
1. Check for keywords at **start** or **end** of note (you explicitly say the bucket)
2. If no keyword match, **AI classifies** based on content
3. Keywords always win over AI

## Setup

### 1. Install Dependencies

```bash
cd /Users/xfinch/.openclaw/workspace/plaud-webhook
npm install mongodb node-fetch
```

### 2. Environment Variables

Add to your `~/.zshrc` or launchd environment:

```bash
# GHL (TTL sub-account)
export GHL_TTL_TOKEN="your_ghl_token"
export GHL_TTL_LOCATION_ID="mhvGjZGZPcsK3vgjEDwI"

# MongoDB (Comcast CRM)
export COMCAST_MONGODB_URI="mongodb://localhost:27017"
export COMCAST_MONGODB_DB="comcast_crm"

# Personal
export PLAUD_IMESSAGE_TARGET="+18176966645"

# Webhook (optional)
export PLAUD_WEBHOOK_SECRET="your_secret_for_zapier"
export PLAUD_PORT="3456"
```

### 3. Start the Server

**Option A: Manual**
```bash
node /Users/xfinch/.openclaw/workspace/plaud-webhook/server.js
```

**Option B: Launchd Service** (recommended)
```bash
launchctl load ~/Library/LaunchAgents/ai.daequan.plaud-webhook.plist
```

### 4. Expose to Internet

**Tailscale (Recommended)**
```bash
tailscale funnel 3456
# URL: https://your-host.tailnet-name.ts.net/plaud-webhook
```

**ngrok (Quick test)**
```bash
ngrok http 3456
# Copy the HTTPS URL
```

## Zapier Configuration

1. **Trigger:** Plaud (wait for Zapier integration, or use webhook polling)
2. **Action:** Webhooks by Zapier → POST

**Webhook URL:** `https://your-host.tailnet-name.ts.net/plaud-webhook`

**Payload (JSON):**
```json
{
  "recording_id": "{{recording_id}}",
  "transcription": "{{transcription}}",
  "summary": "{{summary}}",
  "timestamp": "{{created_at}}",
  "duration": "{{duration}}",
  "tags": "{{tags}}"
}
```

## Usage Examples

**Personal reminder:**
> "PERSONAL: Remind me to call dentist tomorrow and schedule cleaning"

→ Creates iCloud Reminder + iMessage to your phone

**TTL client note:**
> "TTL: Follow up with Trina about cold email campaign deliverability"

→ Adds note to Trina's GHL contact + creates task

**Comcast prospect:**
> "COMCAST: Visited Tony's Pizza on 6th Ave, owner wants triple play for both locations, interested in gigabit"

→ Adds note to CRM + extracts packages (Triple Play, Gigabit) + creates GHL follow-up task

## Testing

```bash
# Test PERSONAL
curl -X POST http://localhost:3456/plaud-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recording_id": "test_001",
    "transcription": "PERSONAL: Remind me to buy milk and call mom",
    "summary": "Personal reminder about groceries and calling mom",
    "timestamp": "2026-02-22T10:00:00Z"
  }'

# Test TTL
curl -X POST http://localhost:3456/plaud-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recording_id": "test_002",
    "transcription": "TTL: Trina wants to discuss the cold email campaign next week",
    "summary": "Client Trina Fallardo wants to discuss email campaign",
    "timestamp": "2026-02-22T10:00:00Z"
  }'

# Test COMCAST
curl -X POST http://localhost:3456/plaud-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recording_id": "test_003",
    "transcription": "COMCAST: Met with business owner at 123 Main St, interested in triple play and gigabit internet",
    "summary": "Prospect wants triple play and gigabit",
    "timestamp": "2026-02-22T10:00:00Z"
  }'

# Test mode (classify only, no actions)
curl -X POST http://localhost:3456/plaud-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "recording_id": "test_004",
    "transcription": "Need to follow up with the client about the proposal",
    "summary": "Follow up on proposal",
    "timestamp": "2026-02-22T10:00:00Z",
    "test": true
  }'
```

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/plaud-webhook` | POST | Main webhook receiver |
| `/plaud-webhook/health` | GET | Health check |
| `/plaud-webhook/test` | POST | Test mode (classify only) |
| `/plaud-webhook/stats` | GET | Processing statistics |

## Memory Logs

All actions are logged to:
- `memory/personal/YYYY-MM-DD.md`
- `memory/ttl/YYYY-MM-DD.md`
- `memory/comcast/YYYY-MM-DD.md`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook not receiving | Check Tailscale/ngrok URL, verify port 3456 is open |
| iCloud Reminder not created | Mac mini must be awake, AppleScript requires GUI session |
| GHL note not added | Verify `GHL_TTL_TOKEN` is set and not expired |
| MongoDB error | Check MongoDB is running, verify `COMCAST_MONGODB_URI` |
| Wrong bucket classification | Use explicit keyword at start/end of recording |

## Files

- `server.js` - Express webhook server
- `classifier.js` - Hybrid keyword + AI classification
- `actions/personal.js` - iCloud + iMessage actions
- `actions/ttl.js` - GHL notes + tasks
- `actions/comcast.js` - MongoDB CRM + package extraction

## Security Notes

- Webhook URL should use HTTPS in production
- Store all tokens in environment variables (never commit to git)
- Zapier can add a custom header for additional verification
- Rate limiting: 10 requests/minute per IP