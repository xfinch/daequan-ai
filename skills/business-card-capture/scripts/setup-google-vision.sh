#!/bin/bash
# Setup script for Google Cloud Vision API
# Run this to configure Google Vision credentials

set -e

echo "=== Google Cloud Vision API Setup ==="
echo ""

# Check if already configured
if launchctl getenv GOOGLE_VISION_API_KEY > /dev/null 2>&1; then
  echo "✓ GOOGLE_VISION_API_KEY is already set"
  echo "  Value: $(launchctl getenv GOOGLE_VISION_API_KEY | cut -c1-20)..."
else
  echo "⚠ GOOGLE_VISION_API_KEY not found in environment"
fi

echo ""
echo "To set up Google Vision API:"
echo ""
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create or select a project"
echo "3. Enable the Cloud Vision API:"
echo "   https://console.cloud.google.com/apis/library/vision.googleapis.com"
echo "4. Create an API key:"
echo "   https://console.cloud.google.com/apis/credentials"
echo "5. Restrict the key to Cloud Vision API only (recommended)"
echo ""
echo "Then add to your environment:"
echo ""
echo "  launchctl setenv GOOGLE_VISION_API_KEY 'your-api-key-here'"
echo ""
echo "Or add to ~/Library/LaunchAgents/ai.daequan.environment.plist:"
echo ""
cat << 'EOF'
  <key>GOOGLE_VISION_API_KEY</key>
  <string>YOUR_API_KEY_HERE</string>
EOF

echo ""
echo "=== Testing ==="
echo ""

# Check current environment
if launchctl getenv GOOGLE_VISION_API_KEY > /dev/null 2>&1; then
  echo "✓ GOOGLE_VISION_API_KEY is set"
  
  # Quick API test
  echo "Testing API connectivity..."
  KEY=$(launchctl getenv GOOGLE_VISION_API_KEY)
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://vision.googleapis.com/v1/images:annotate?key=$KEY" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"requests":[{"image":{"content":""},"features":[{"type":"TEXT_DETECTION"}]}]}' 2>/dev/null)
  
  if [ "$RESPONSE" = "400" ]; then
    echo "✓ API key is valid (400 = expected for empty image)"
  elif [ "$RESPONSE" = "403" ]; then
    echo "✗ API key invalid or API not enabled (403)"
  else
    echo "? API test returned: $RESPONSE"
  fi
else
  echo "✗ GOOGLE_VISION_API_KEY not set"
fi

echo ""
echo "=== Current OCR Configuration ==="
echo ""

if launchctl getenv GOOGLE_VISION_API_KEY > /dev/null 2>&1; then
  echo "Primary OCR: Google Cloud Vision API"
else
  echo "Primary OCR: Not configured"
fi

if launchctl getenv OPENAI_API_KEY > /dev/null 2>&1; then
  echo "Fallback OCR: OpenAI Vision (gpt-4o-mini)"
else
  echo "Fallback OCR: Not configured"
fi

echo ""
echo "Setup complete!"
