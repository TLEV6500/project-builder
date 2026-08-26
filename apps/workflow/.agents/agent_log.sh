#!/bin/bash

# agent_log.sh - Utility to create structured logs and research notes

MODE=$1 # "log" or "note"
TITLE=$2 # Three word title

if [[ -z "$MODE" || -z "$TITLE" ]]; then
    echo "Usage: ./agent_log.sh [log|note] \"three word title\""
    exit 1
fi

# Format title: replace spaces with underscores and lowercase
FORMATTED_TITLE=$(echo "$TITLE" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${FORMATTED_TITLE}_${TIMESTAMP}.md"

if [[ "$MODE" == "log" ]]; then
    FILE_PATH="./.agents/logs/$FILENAME"
    CONTENT="# Task Log: $TITLE\n\n## Task\n\n## Problems Encountered\n\n## Solutions & Results\n"
elif [[ "$MODE" == "note" ]]; then
    FILE_PATH="./.agents/notes/$FILENAME"
    CONTENT="# Research Notes: $TITLE\n\n## Findings\n\n## Sources\n"
else
    echo "Invalid mode. Use 'log' or 'note'."
    exit 1
fi

echo -e "$CONTENT" > "$FILE_PATH"
echo "Created: $FILE_PATH"
