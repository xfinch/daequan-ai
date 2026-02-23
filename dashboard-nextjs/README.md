# Daequan Admin Dashboard (Next.js)

Real-time skills monitoring dashboard with MongoDB Change Streams and Server-Sent Events.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   MongoDB       │◀────│   Express API   │
│   (Dashboard)   │     │   Change Stream │     │   (Main Server) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                              │
         │                    POST /api/skills/log      │
         │◀─────────────────────────────────────────────│
         │                                              │
         │ SSE: /api/skills/usage/stream                │
         │◀─────────────────────────────────────────────│
```

## Features

- **Server Components**: Initial data fetch on server (fast first paint)
- **Client Components**: Live updates without page refresh
- **MongoDB Change Streams**: Real-time database change detection
- **Server-Sent Events (SSE)**: Silent push updates to client
- **Smart Polling**: Stats update every 5 seconds (fallback)
- **Connection Status**: Visual indicator for real-time connection

## Update Strategies

| Component | Update Method | Trigger |
|-----------|---------------|---------|
| Stats Cards | Smart Polling | Every 5s or on new activity |
| Skills Grid | Smart Polling | Every 5s |
| Activity Feed | SSE (Change Stream) | Immediate on DB insert |

## Setup

```bash
cd dashboard-nextjs
npm install

# Create .env.local
cat > .env.local << EOF
MONGO_URL=mongodb://localhost:27017/daequan
# or Railway URL
EOF

# Run dev server
npm run dev
```

## Deployment

### Option 1: Standalone (Port 3001)
```bash
npm run build
npm start
```

### Option 2: Behind Nginx
```nginx
location /admin/skills {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/skills/stats` | GET | Aggregated skill statistics |
| `/api/skills/usage` | GET | Recent usage (last 20) |
| `/api/skills/usage/stream` | SSE | Real-time activity stream |

## From Main Server

To log skill usage from the main Express server:

```javascript
// In your skill handlers
await fetch('http://localhost:3001/api/skills/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    skillId: 'voice-notes-router',
    skillName: 'Voice Notes Router',
    action: 'Processed COMCAST note',
    detail: 'Federal Way Auto Repair',
    status: 'success',
    metadata: { bucket: 'COMCAST' }
  })
});
```
