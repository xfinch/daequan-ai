#!/usr/bin/env zsh
# Generate podcast-style audio narration from document content
# Uses sag (ElevenLabs) skill for TTS

set -e

# Check dependencies
if ! command -v sag &> /dev/null; then
    echo "Error: sag (ElevenLabs TTS) not found"
    echo "Install with: npm install -g @openclaw/sag"
    exit 1
fi

# Parse arguments
VOICE="Josh"
STYLE="professional"
TEXT=""
OUTPUT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --voice|-v)
            VOICE="$2"
            shift 2
            ;;
        --style|-s)
            STYLE="$2"
            shift 2
            ;;
        --output|-o)
            OUTPUT="$2"
            shift 2
            ;;
        --file|-f)
            TEXT=$(cat "$2")
            shift 2
            ;;
        *)
            if [[ -z "$TEXT" ]]; then
                TEXT="$1"
            else
                TEXT="$TEXT $1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$TEXT" ]]; then
    echo "Usage: podcast.sh [options] <text or --file path>"
    echo ""
    echo "Options:"
    echo "  --voice, -v     Voice to use (default: Josh)"
    echo "  --style, -s     Speaking style (professional, conversational, energetic)"
    echo "  --file, -f      Read text from file"
    echo "  --output, -o    Output file path"
    echo ""
    echo "Examples:"
    echo '  podcast.sh "Here is my summary"'
    echo '  podcast.sh --file document.txt --voice Adam'
    exit 1
fi

# Apply style modifiers
case $STYLE in
    conversational)
        TEXT="Hey, let me tell you about this. $TEXT"
        ;;
    energetic)
        TEXT="Exciting news! $TEXT"
        ;;
    professional|*)
        # Default, no modification
        ;;
esac

# Generate audio
echo "🎙️ Generating podcast narration with voice: $VOICE"

if [[ -n "$OUTPUT" ]]; then
    sag say "$TEXT" --voice "$VOICE" --output "$OUTPUT"
    echo "✅ Audio saved to: $OUTPUT"
else
    sag say "$TEXT" --voice "$VOICE"
fi
