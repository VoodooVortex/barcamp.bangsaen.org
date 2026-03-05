#!/bin/bash
# =============================================================================
# Secret Scanner Script
# Part of the owasp-audit skill
#
# Scans the codebase for hardcoded secrets, api keys, and sensitive tokens.
# Usage: bash secret_scan.sh [target_directory]
# =============================================================================

TARGET_DIR="${1:-.}"
EXCLUDE_DIRS=(".git" "node_modules" "dist" "build" ".bun" "bun.lock" "package-lock.json")

echo "========================================"
echo " Hardcoded Secret Scanner"
echo " Target: $(realpath "$TARGET_DIR")"
echo " Date:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================"
echo ""

# Build exclude string for grep
EXCLUDE_STR=""
for d in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_STR="$EXCLUDE_STR --exclude-dir=$d"
done

# Patterns to scan for
PATTERNS=(
    "password\s*[:=]\s*['\"][^'\"]+['\"]"
    "secret\s*[:=]\s*['\"][^'\"]+['\"]"
    "api[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]"
    "token\s*[:=]\s*['\"][^'\"]+['\"]"
    "private[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]"
    "aws[_-]?access[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]"
    "bearer\s+['\"][^'\"]+['\"]"
)

FOUND_SECRETS=0

for pattern in "${PATTERNS[@]}"; do
    # Use -r for recursive, -n for line number, -E for extended regex, -i for case-insensitive
    RESULTS=$(grep -rnEi $EXCLUDE_STR "$pattern" "$TARGET_DIR" || true)
    
    if [ ! -z "$RESULTS" ]; then
        echo ">> Potential secrets found with pattern: $pattern"
        echo "----------------------------------------"
        echo "$RESULTS"
        echo ""
        # Count lines in results
        COUNT=$(echo "$RESULTS" | wc -l)
        FOUND_SECRETS=$((FOUND_SECRETS + COUNT))
    fi
done

echo "========================================"
if [ "$FOUND_SECRETS" -eq 0 ]; then
    echo " No common hardcoded secrets detected."
else
    echo " Found $FOUND_SECRETS potential hardcoded secrets."
fi
echo "========================================"
