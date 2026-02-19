#!/bin/bash
# TTL High Level API Helper
# Usage: ./ttl-api.sh <endpoint> [method] [body]

TOKEN_SUB="[REDACTED-GHL-TTL]"
TOKEN_AGENCY="pit-cb9eb481-42f8-481e-8dbc-d8ed12cdc986"
BASE_URL="https://services.leadconnectorhq.com"

ENDPOINT="$1"
METHOD="${2:-GET}"
BODY="$3"
TOKEN="${4:-$TOKEN_SUB}"  # Default to sub-account token

if [ -z "$ENDPOINT" ]; then
    echo "Usage: $0 <endpoint> [method] [body] [token_type]"
    echo "  token_type: sub (default) or agency"
    exit 1
fi

# Use agency token if specified
if [ "$TOKEN" = "agency" ]; then
    TOKEN="$TOKEN_AGENCY"
fi

if [ -n "$BODY" ]; then
    curl -s -X "$METHOD" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -H "Version: 2021-07-28" \
        -d "$BODY" \
        "$BASE_URL$ENDPOINT"
else
    curl -s -X "$METHOD" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -H "Version: 2021-07-28" \
        "$BASE_URL$ENDPOINT"
fi