#!/bin/bash
# Read JSON from stdin (provided by Claude Code hooks)
INPUT=$(cat)

# Extract project name from cwd
CWD=$(echo "$INPUT" | grep -o '"cwd":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$CWD" ]; then
  PROJECT=$(basename "$CWD")
else
  PROJECT="Unknown Project"
fi

# Extract title and message from hook input
TITLE=$(echo "$INPUT" | grep -o '"title":"[^"]*"' | head -1 | cut -d'"' -f4)
MESSAGE=$(echo "$INPUT" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)

# Use provided title or fall back to first argument
TITLE="${TITLE:-$1}"
MESSAGE="${MESSAGE:-Claude Code}"

# Sound: use second argument if provided, otherwise no sound
SOUND="$2"

# Build and execute osascript notification
if [ -n "$SOUND" ]; then
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" subtitle \"$PROJECT\" sound name \"$SOUND\""
else
  osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" subtitle \"$PROJECT\""
fi
