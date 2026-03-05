#!/bin/bash
# =============================================================================
# Header Checker Script
# Part of the owasp-audit skill
#
# Checks HTTP response headers for security best practices.
# Usage: bash check_headers.sh <URL>
# =============================================================================

URL=$1

if [ -z "$URL" ]; then
    echo "Usage: bash check_headers.sh <URL>"
    exit 1
fi

echo "========================================"
echo " Security Header Checker"
echo " Target: $URL"
echo " Date:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================"
echo ""

# Capture headers using curl
HEADERS=$(curl -sI -L "$URL")

if [ -z "$HEADERS" ]; then
    echo "[!] Error: Could not fetch headers from $URL"
    exit 1
fi

REQUIRED_HEADERS=(
    "Content-Security-Policy"
    "X-Content-Type-Options"
    "X-Frame-Options"
    "Strict-Transport-Security"
    "Referrer-Policy"
    "Permissions-Policy"
)

MISSING_COUNT=0

for header in "${REQUIRED_HEADERS[@]}"; do
    # Check if header exists (case insensitive)
    if ! echo "$HEADERS" | grep -qi "^$header:"; then
        echo "[!] Missing: $header"
        MISSING_COUNT=$((MISSING_COUNT + 1))
    else
        # Extract and print value
        VALUE=$(echo "$HEADERS" | grep -i "^$header:" | cut -d' ' -f2-)
        echo "[✓] Present: $header: $VALUE"
    fi
done

echo ""
echo "========================================"
if [ "$MISSING_COUNT" -eq 0 ]; then
    echo " All core security headers are present."
else
    echo " Missing $MISSING_COUNT recommended security headers."
fi
echo "========================================"
