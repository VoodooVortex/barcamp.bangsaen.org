# Audit Methodology

This document outlines the systematic process for performing a security audit using the `owasp-audit` skill.

---

## Step 1: Reconnaissance

Identify the target application's tech stack, architecture, and attack surface:

- **Runtime**: Node.js / Bun / Deno / Python / Go
- **Framework**: Express / Hono / Elysia / FastAPI / Gin
- **Database**: SQL (Postgres, SQLite) / NoSQL (Mongo) — and ORM used (Drizzle, Prisma, etc.)
- **Auth**: JWT / Session / OAuth — library used (jose, passport, etc.)
- **Frontend**: SPA / SSR / static — rendering method (innerHTML, template literals, JSX)

## Step 2: Systematic Review

Work through each OWASP category using the checklist. For each category:

1. Read the detailed description in `resources/owasp_top_10.md`.
2. Go through every check item in `resources/audit_checklist.md`.
3. Search the codebase for patterns matching the vulnerability (see `resources/vulnerability_patterns.md`).
4. Record each finding with severity, evidence (file + line), and recommended fix.

## Step 3: Automated Checks

Run automated tools where available:

- **Dependency audit**: Use the helper script at `scripts/dependency_audit.sh`, or run the appropriate command manually:
  - `npm audit` / `bun pm audit` / `pip audit` / `go mod verify`
- **Secret scanning**: Use `scripts/secret_scan.sh` to find hardcoded credentials.
- **Header checks**: Use `scripts/check_headers.sh` (if the app is running) to verify security headers.
- **Pattern search**: Use `scripts/search_patterns.sh` for automated regex-based discovery.

## Step 4: Report Findings

Use the template in `resources/report_template.md` to produce a structured report. 
Refer to `examples/sample_report.md` for a completed example.
