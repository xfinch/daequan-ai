#!/bin/bash
# List pending/incomplete business card entries

PARTIAL_DIR="$(dirname "$0")/../data/partial"

echo "=== Pending Business Card Entries ==="
echo ""

if [ ! -d "$PARTIAL_DIR" ] || [ -z "$(ls -A "$PARTIAL_DIR" 2>/dev/null)" ]; then
  echo "No pending entries found."
  exit 0
fi

for file in "$PARTIAL_DIR"/*.json; do
  if [ -f "$file" ]; then
    id=$(basename "$file" .json)
    timestamp=$(jq -r '.timestamp' "$file" 2>/dev/null | cut -d'T' -f1)
    name=$(jq -r '.data.name // "Unknown"' "$file" 2>/dev/null)
    business=$(jq -r '.data.business // "N/A"' "$file" 2>/dev/null)
    missing=$(jq -r '.missing | join(", ")' "$file" 2>/dev/null)
    
    echo "📇 $id"
    echo "   Name: $name"
    echo "   Business: $business"
    echo "   Date: $timestamp"
    echo "   Missing: $missing"
    echo ""
  fi
done

echo "Total pending: $(ls -1 "$PARTIAL_DIR"/*.json 2>/dev/null | wc -l)"
