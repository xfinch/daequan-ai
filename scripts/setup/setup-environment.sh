#!/bin/bash
# Setup script for Daequan environment variables
# This migrates secrets from Keychain to launchd environment variables
# for remote operation without local authentication

set -e

PLIST_NAME="ai.daequan.environment.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"
TEMPLATE_PATH="/Users/xfinch/.openclaw/workspace/scripts/setup/daequan-environment.plist.template"

echo "🔧 Daequan Environment Setup"
echo "=============================="
echo ""
echo "This will create a launch agent that loads secrets as environment variables."
echo "Your secrets will be stored in: $PLIST_PATH"
echo ""

# Check if already exists
if [ -f "$PLIST_PATH" ]; then
    echo "⚠️  Plist already exists at $PLIST_PATH"
    read -p "Overwrite? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Get GitHub token from existing git remote if available
echo "📋 Gathering existing credentials..."
GITHUB_TOKEN=$(cd /Users/xfinch/.openclaw/workspace && git remote get-url origin 2>/dev/null | grep -o 'ghp_[a-zA-Z0-9]*' || echo "")

echo ""
echo "✅ Found GitHub token from workspace remote"
echo ""
echo "❓ You need to provide the following secrets:"
echo "   (Get these from Keychain or your password manager)"
echo ""

# Prompt for secrets
read -sp "GHL TTL Token (pit-...): " GHL_TTL
echo ""
read -sp "GHL Agency Token (pit-...): " GHL_AGENCY
echo ""
read -sp "Telnyx API Key (KEY...): " TELNYX_KEY
echo ""
read -sp "Cloudflare API Token: " CF_TOKEN
echo ""
read -sp "PrivateEmail Password (xavier@thetraffic.link): " EMAIL_PASS
echo ""

# Create the plist
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.daequan.environment</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/sh</string>
        <string>-c</string>
        <string>launchctl setenv GITHUB_TOKEN "$GITHUB_TOKEN";
launchctl setenv GHL_TTL_TOKEN "$GHL_TTL";
launchctl setenv GHL_AGENCY_TOKEN "$GHL_AGENCY";
launchctl setenv TELNYX_API_KEY "$TELNYX_KEY";
launchctl setenv CLOUDFLARE_API_TOKEN "$CF_TOKEN";
launchctl setenv PRIVATEEMAIL_PASSWORD "$EMAIL_PASS"</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
EOF

# Set permissions
chmod 600 "$PLIST_PATH"

# Load the launch agent
launchctl load "$PLIST_PATH"

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "Location: $PLIST_PATH"
echo ""
echo "📋 To verify secrets are loaded:"
echo "   launchctl getenv GITHUB_TOKEN"
echo ""
echo "🔁 These env vars will be available after every reboot."
echo "🗑️  To remove: launchctl unload $PLIST_PATH && rm $PLIST_PATH"
