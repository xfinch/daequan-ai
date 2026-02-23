# Railway Deployment Guide

## Deploy to Railway

### 1. Create New Service
- In Railway dashboard, click "New Service"
- Select "Deploy from GitHub repo"
- Choose `xfinch/daequan-ai`

### 2. Configure Build
- **Root Directory**: `daequan-nextjs`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 3. Environment Variables (already set from Express app)
These should already be in your Railway project:
- ✅ `MONGO_URL` or `MONGO_PUBLIC_URL` 
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `ADMIN_EMAILS`
- ✅ `SUPERADMIN_EMAILS`

The Next.js app will automatically use these (it checks for both `MONGODB_URI` and `MONGO_URL`).

### 4. Add Domain
- In Railway, go to service Settings → Domains
- Add custom domain: `daequanai.com`
- Update DNS to point to Railway

### 5. Deploy
- Railway will auto-deploy on push
- Or manually trigger deploy

## Local Development

```bash
cd daequan-nextjs
npm install

# Copy environment from your plist or Railway
export MONGO_URL="your_railway_mongo_url"
export GOOGLE_CLIENT_ID="your_id"
export GOOGLE_CLIENT_SECRET="your_secret"
export ADMIN_EMAILS="xavier@thetraffic.link"
export SUPERADMIN_EMAILS="xavier@thetraffic.link"

npm run dev
```

Visit http://localhost:3000

## Testing Before Switch

1. Deploy to Railway on a test domain (e.g., `v2.daequanaicom`)
2. Test all features:
   - Login with Google
   - Skills dashboard
   - Kanban boards
   - Comcast map
3. When ready, switch main domain to Next.js service

## Rollback

If issues arise:
1. Switch domain back to Express service in Railway
2. Fix issues in Next.js
3. Redeploy
