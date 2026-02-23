#!/bin/bash

echo "🔍 Checking Next.js deployment readiness..."
echo ""

# Check required files
echo "✓ Checking required files..."
required_files=(
  "package.json"
  "next.config.js"
  "tsconfig.json"
  "tailwind.config.js"
  "postcss.config.js"
  "railway.toml"
  "app/layout.tsx"
  "app/page.tsx"
  "lib/db.ts"
  "lib/auth.ts"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file MISSING"
    exit 1
  fi
done

# Check kanban files
echo ""
echo "✓ Checking kanban files..."
kanban_files=(
  "kanban-ttl.md"
  "kanban-comcast.md"
  "kanban-personal.md"
)

for file in "${kanban_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file MISSING"
  fi
done

# Check environment variables
echo ""
echo "✓ Checking environment variables..."
required_env=(
  "MONGO_URL"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
)

for var in "${required_env[@]}"; do
  if [ -n "${!var}" ]; then
    echo "  ✓ $var is set"
  else
    echo "  ⚠ $var not set (will use Railway's value)"
  fi
done

echo ""
echo "🎉 Ready for Railway deployment!"
echo ""
echo "To deploy:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. In Railway dashboard:"
echo "     - New Service → GitHub Repo"
echo "     - Select xfinch/daequan-ai"
echo "     - Root Directory: daequan-nextjs"
echo "     - Deploy"
echo ""
echo "Or use Railway CLI:"
echo "  railway login"
echo "  railway link"
echo "  railway up"
