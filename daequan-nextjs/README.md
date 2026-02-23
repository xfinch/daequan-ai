# Daequan AI - Next.js Migration

This is a complete Next.js rewrite of the Daequan AI platform, replacing the Express.js server.

## Architecture

```
Next.js App Router (App Dir)
├── app/
│   ├── page.tsx                    # Home page
│   ├── layout.tsx                  # Root layout
│   ├── login/page.tsx              # Login page
│   ├── comcast/page.tsx            # Comcast territory map
│   ├── admin/
│   │   ├── skills/page.tsx         # Skills dashboard
│   │   ├── boards/page.tsx         # Kanban boards
│   │   ├── overview/page.tsx       # Decisions overview
│   │   └── users/page.tsx          # User management
│   └── api/
│       ├── auth/[...nextauth]      # NextAuth.js routes
│       ├── kanban/route.ts         # Kanban data API
│       ├── skills/                 # Skills tracking API
│       └── visits/                 # Comcast visits API
├── components/
│   ├── ui/navbar.tsx               # Main navigation
│   ├── admin/                      # Admin components
│   └── kanban/                     # Kanban components
├── lib/
│   ├── db.ts                       # MongoDB connection
│   ├── auth.ts                     # NextAuth config
│   └── kanban-parser.ts            # Markdown parser
└── middleware.ts                   # Auth middleware
```

## Features

### Authentication
- Google OAuth via NextAuth.js v5
- Middleware-based route protection
- Role-based access (user, admin, superadmin)

### Skills Dashboard
- Server-side data fetching
- Real-time activity feed via SSE
- Stats aggregation from MongoDB

### Kanban Boards
- Dynamic loading from markdown files
- Tab switching between TTL/Comcast/Personal
- Real-time updates on refresh

### Comcast Map
- Leaflet.js integration
- Visit management
- GHL sync integration

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Admin Emails
ADMIN_EMAILS=admin@example.com
SUPERADMIN_EMAILS=superadmin@example.com
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Build and start:
```bash
npm run build
npm start
```

Or deploy to Vercel/Railway with zero config.

## Migration from Express

| Express Route | Next.js Route |
|--------------|---------------|
| `GET /` | `app/page.tsx` |
| `GET /login` | `app/login/page.tsx` |
| `GET /comcast` | `app/comcast/page.tsx` |
| `GET /admin/skills` | `app/admin/skills/page.tsx` |
| `GET /admin/boards` | `app/admin/boards/page.tsx` |
| `GET /api/kanban/:type` | `app/api/kanban/route.ts` |
| `GET /api/skills/stats` | `app/api/skills/stats/route.ts` |
| `POST /api/visits` | `app/api/visits/route.ts` |

## Benefits Over Express

1. **Server Components** - Automatic code splitting, no client JS for static content
2. **File-based routing** - No manual route definitions
3. **Built-in API routes** - Colocated with pages
4. **TypeScript first** - Full type safety
5. **Edge ready** - Can deploy to edge functions
6. **Image optimization** - Automatic image optimization
7. **Font optimization** - Automatic font loading
