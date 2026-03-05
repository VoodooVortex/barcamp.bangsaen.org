#!/bin/bash
# =============================================================================
# Patterns Search Script
# Part of the owasp-audit skill
#
# Searches the codebase for technical vulnerability patterns.
# Usage: bash search_patterns.sh [target_directory]
# =============================================================================

TARGET_DIR="${1:-.}"
SKILL_DIR="$(dirname "$0")/.."
PATTERNS_FILE="$SKILL_DIR/resources/vulnerability_patterns.md"
PATTERNS_EXT_FILE="$SKILL_DIR/resources/vulnerability_patterns_extended.md"

EXCLUDE_DIRS=(".git" "node_modules" "dist" "build" ".bun")

echo "========================================"
echo " Vulnerability Pattern Search"
echo " Target: $(realpath "$TARGET_DIR")"
echo " Date:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================"
echo ""

# Build exclude string for grep
EXCLUDE_STR=""
for d in "${EXCLUDE_DIRS[@]}"; do
    EXCLUDE_STR="$EXCLUDE_STR --exclude-dir=$d"
done

# Extract patterns from the markdown files (lines starting with - and containing `code`)
function extract_and_search() {
    local file=$1
    if [ ! -f "$file" ]; then return; fi
    
    echo ">> Reading patterns from $(basename "$file")..."
    
    # This is a bit naive but looks for common search strings in backticks in the md files
    grep -o '`[^`]*`' "$file" | tr -d '`' | while read -r pattern; do
        if [[ ${#pattern} -lt 3 ]]; then continue; fi # Skip very short strings
        
        echo "   Checking: $pattern"
        RESULTS=$(grep -rn "$EXCLUDE_STR" "$pattern" "$TARGET_DIR" | grep -v "$SKILL_DIR" || true)
        
        if [ ! -z "$RESULTS" ]; then
            echo "   [!] Matches found:"
            echo "   ----------------------------------------"
            echo "$RESULTS" | sed 's/^/   /'
            echo ""
        fi
    done
}

extract_and_search "$PATTERNS_FILE"
extract_and_search "$PATTERNS_EXT_FILE"

echo "========================================"
echo " Pattern search complete."
echo "========================================"
