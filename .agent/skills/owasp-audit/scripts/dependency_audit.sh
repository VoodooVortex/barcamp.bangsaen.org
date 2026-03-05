#!/bin/bash
# =============================================================================
# Dependency Audit Script
# Part of the owasp-audit skill
#
# Detects the project type and runs the appropriate dependency audit tool.
# Usage: bash dependency_audit.sh [project_directory]
# =============================================================================

set -e

PROJECT_DIR="${1:-.}"
FOUND_TOOL=false

echo "========================================"
echo " Dependency Security Audit"
echo " Target: $(realpath "$PROJECT_DIR")"
echo " Date:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "========================================"
echo ""

cd "$PROJECT_DIR"

# --- Node.js / Bun ---
if [ -f "package.json" ]; then
    FOUND_TOOL=true
    echo ">> Detected: Node.js / Bun project (package.json found)"
    echo ""

    if command -v bun &> /dev/null; then
        echo ">> Running: bun pm audit"
        echo "----------------------------------------"
        bun pm audit 2>&1 || echo "[!] bun pm audit exited with errors (see above)"
        echo ""
    fi

    if command -v npm &> /dev/null; then
        echo ">> Running: npm audit"
        echo "----------------------------------------"
        npm audit --omit=dev 2>&1 || echo "[!] npm audit exited with errors (see above)"
        echo ""
    fi

    # Check for outdated packages
    if command -v npm &> /dev/null; then
        echo ">> Running: npm outdated"
        echo "----------------------------------------"
        npm outdated 2>&1 || true
        echo ""
    fi
fi

# --- Python ---
if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ] || [ -f "Pipfile" ]; then
    FOUND_TOOL=true
    echo ">> Detected: Python project"
    echo ""

    if command -v pip-audit &> /dev/null; then
        echo ">> Running: pip-audit"
        echo "----------------------------------------"
        pip-audit 2>&1 || echo "[!] pip-audit exited with errors (see above)"
        echo ""
    elif command -v pip &> /dev/null; then
        echo "[!] pip-audit not installed. Install with: pip install pip-audit"
        echo ">> Running: pip check (dependency consistency)"
        echo "----------------------------------------"
        pip check 2>&1 || true
        echo ""
    fi
fi

# --- Go ---
if [ -f "go.mod" ]; then
    FOUND_TOOL=true
    echo ">> Detected: Go project (go.mod found)"
    echo ""

    echo ">> Running: go mod verify"
    echo "----------------------------------------"
    go mod verify 2>&1 || echo "[!] go mod verify failed (see above)"
    echo ""

    if command -v govulncheck &> /dev/null; then
        echo ">> Running: govulncheck"
        echo "----------------------------------------"
        govulncheck ./... 2>&1 || echo "[!] govulncheck exited with errors (see above)"
        echo ""
    else
        echo "[!] govulncheck not installed. Install with: go install golang.org/x/vuln/cmd/govulncheck@latest"
    fi
fi

# --- Rust ---
if [ -f "Cargo.toml" ]; then
    FOUND_TOOL=true
    echo ">> Detected: Rust project (Cargo.toml found)"
    echo ""

    if command -v cargo-audit &> /dev/null; then
        echo ">> Running: cargo audit"
        echo "----------------------------------------"
        cargo audit 2>&1 || echo "[!] cargo audit exited with errors (see above)"
        echo ""
    else
        echo "[!] cargo-audit not installed. Install with: cargo install cargo-audit"
    fi
fi

# --- Summary ---
echo "========================================"
if [ "$FOUND_TOOL" = false ]; then
    echo "[!] No recognized project files found in $(realpath "$PROJECT_DIR")"
    echo "    Supported: package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml"
else
    echo " Audit complete. Review findings above."
fi
echo "========================================"
