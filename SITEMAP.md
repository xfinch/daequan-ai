# DaequanAI.com Site Map

## Public Routes (No Login Required)

| Route | Description | Purpose |
|-------|-------------|---------|
| `/` | Home / Landing | Main entry point |
| `/comcast` | Comcast Territory Map | Interactive map with business pins |
| `/comcast/review` | Voice Note Review Queue | Manually assign unmatched notes |
| `/login` | Google OAuth Login | Admin authentication |
| `/auth/google` | Google OAuth Init | Starts login flow |
| `/auth/google/callback` | OAuth Callback | Completes login → redirects to admin |
| `/health` | System Health Check | API status endpoint |

## Admin Routes (Login Required)

### Main Dashboard
| Route | Description | Live Updates |
|-------|-------------|--------------|
| `/admin` | **→ Redirects to `/admin/skills`** | - |
| `/admin/skills` | **Skills Dashboard** (Default) | Real-time activity feed |

### Admin Sub-Pages
| Route | Description | Access |
|-------|-------------|--------|
| `/admin/overview` | Decisions & Stats Overview | Admin+ |
| `/admin/users` | User Management Table | Admin+ |

## API Routes

### Public API
| Route | Method | Description |
|-------|--------|-------------|
| `/api/visits` | GET | List all Comcast visits |
| `/api/visits` | POST | Create new visit |
| `/api/visits/:id` | PATCH | Update visit |
| `/api/visits/:id/ghl` | PATCH | Link GHL contact ID |
| `/api/visits/:id/changelog` | GET | View audit log for visit |

### Admin API
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/user` | GET | Current user info | Any |
| `/api/admin/stats` | GET | Dashboard statistics | Admin+ |
| `/api/admin/users` | GET | List all users | Admin+ |
| `/api/admin/users/:id/role` | PATCH | Change user role | Superadmin only |

### Skills API
| Route | Method | Description | Auth |
|-------|--------|-------------|------|
| `/api/skills/log` | POST | Log skill usage | Any (internal) |
| `/api/skills/usage` | GET | Recent activity | Admin+ |
| `/api/skills/usage/stream` | SSE | Real-time stream | Admin+ |
| `/api/skills/stats` | GET | Aggregated stats | Admin+ |

### Webhooks
| Route | Method | Description |
|-------|--------|-------------|
| `/plaud-webhook` | POST | Receive Plaud voice notes |
| `/plaud-webhook/health` | GET | Webhook health check |
| `/plaud-webhook/stats` | GET | Processing statistics |
| `/plaud-webhook/review` | GET | Review queue UI |

## Visual Navigation Flow

```
┌─────────────────┐
│   daequanaicom  │
│   (Public)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼──────┐
│/comcast│  │ /login  │
│  Map   │  │(Google) │
└────────┘  └────┬────┘
                 │
         ┌───────┴────────┐
         │   Admin Zone   │
         │  (Auth Required)│
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌────▼───┐
│/admin  │  │/admin  │  │/admin  │
│/skills │  │/overview│  │/users  │
│(Default)│  │(Decisions)│  │(Manage)│
└────────┘  └─────────┘  └────────┘
    │
    ├─ Real-time activity feed
    ├─ Skill usage stats
    └─ Live updates via SSE
```

## Quick Links Reference

**Main Site:**
- Home: `https://daequanai.com`
- Comcast Map: `https://daequanai.com/comcast`
- Review Queue: `https://daequanai.com/comcast/review`

**Admin (requires login):**
- Dashboard: `https://daequanai.com/admin/skills`
- Decisions: `https://daequanai.com/admin/overview`
- Users: `https://daequanai.com/admin/users`

**Navigation:**
- All admin pages have top nav with: Skills | Decisions | Users | ← Main Site | Logout
- Default landing after login: Skills Dashboard
- Logout redirects to home page

## File Locations (Development)

| Route | Source File |
|-------|-------------|
| `/` | `server.js` (inline HTML) |
| `/comcast` | `comcast/index.html` |
| `/admin/skills` | `admin-dashboard/index.html` |
| `/admin/overview` | `server.js` (inline HTML) |
| API routes | `server.js` |
| Plaud webhook | `plaud-webhook/server.js` |
| Next.js dashboard | `dashboard-nextjs/` (future) |
