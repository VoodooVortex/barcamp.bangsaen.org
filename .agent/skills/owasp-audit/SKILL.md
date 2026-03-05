---
name: owasp-audit
version: 1.1.0
owasp_version: "2023"
last_updated: 2026-02-18
description: Performs a comprehensive security audit of a web application based on the OWASP Top 10 (2023). Use this when you need to verify security posture, review code for vulnerabilities, or implement security best practices.
---

# OWASP Security Audit Skill

This skill provides a systematic, severity-rated approach to auditing web application security using the OWASP Top 10 (2023) framework. It produces a structured findings report that can be used to prioritize remediation.

## When to Use This Skill

- When asked to perform a **security audit**, **security review**, or **penetration test** of an application.
- During the **VERIFICATION** phase of any project that handles user data, authentication, or sensitive operations.
- When implementing new features, to ensure they follow security best practices.
- When reviewing pull requests or code changes for security implications.

## Quick Links

- **Methodology**: Detailed audit process in [methodology.md](file:///c:/Users/warat/Documents/project/CorgiDev/cyber-security-skills/.agent/skills/owasp-audit/resources/methodology.md)
- **Classification**: Severity framework in [severity_guidance.md](file:///c:/Users/warat/Documents/project/CorgiDev/cyber-security-skills/.agent/skills/owasp-audit/resources/severity_guidance.md)
- **Checklist**: Actionable check items in [audit_checklist.md](file:///c:/Users/warat/Documents/project/CorgiDev/cyber-security-skills/.agent/skills/owasp-audit/resources/audit_checklist.md)

## Core Resources Reference

### Knowledge & Methodology
| File | Purpose |
|---|---|
| `resources/methodology.md` | **START HERE**: Systematic 4-step audit process |
| `resources/severity_guidance.md` | Framework for assigning Critical to Info severity levels |
| `resources/owasp_top_10.md` | Detailed descriptions, CWE refs, and mitigations per category |
| `resources/audit_checklist.md` | Severity-rated verification checklist (Manual vs Automated) |
| `resources/false_positives.md` | Guidance on identifying and filtering security tool noise |


### Technical Patterns
| File | Purpose |
|---|---|
| `resources/vulnerability_patterns.md` | Core patterns for Auth, DB, Frontend, and Server |
| `resources/vulnerability_patterns_extended.md` | Advanced patterns: API, File Upload, Session, Gaps |
| `resources/remediation_examples.md` | Side-by-side "Vulnerable vs Secure" code repository |
| `resources/patterns_{lang}.md` | Language-specific regex and detection logic (TS, Py, Go, Rs, PHP) |

### Examples & Templates
| File | Purpose |
|---|---|
| `resources/report_template.md` | Standardized template with CVSS 3.1 and Timelines |
| `examples/sample_report.md` | Standard app audit (Task Manager) |
| `examples/api_service_report.md` | REST API service audit example |
| `examples/spa_report.md` | Single Page App (React) audit example |
| `examples/microservices_report.md` | Distributed architecture audit example |
| `examples/mobile_backend_report.md` | Mobile API backend audit example |
| `examples/security_tests/` | Reusable test cases and payloads (XSS, Auth, IDOR) |

### Automation Scripts
| File | Purpose |
|---|---|
| `scripts/dependency_audit.sh` | Cross-platform dependency vulnerability scanner |
| `scripts/secret_scan.sh` | Grep-based search for hardcoded secrets/keys |
| `scripts/check_headers.sh` | Curl-based HTTP security header verification |
| `scripts/search_patterns.sh` | Automated vulnerability discovery from md patterns |
