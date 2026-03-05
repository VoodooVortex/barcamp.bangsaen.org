# Severity Classification Guidance

This document provides a framework for determining the severity of security findings.

## Severity Levels

| Severity | Description | Example |
|---|---|---|
| **Critical** | Immediate exploitation risk, data breach possible | Hardcoded secrets, SQL injection, no auth on admin routes |
| **High** | Significant risk, likely exploitable | XSS via innerHTML, missing CORS policy, weak JWT config |
| **Medium** | Moderate risk, requires specific conditions | No rate limiting, verbose error messages, missing CSRF |
| **Low** | Minor risk, defense-in-depth concern | Missing security headers, no request logging |
| **Info** | Observation, not directly exploitable | Outdated (but not vulnerable) dependencies, code style |

---

## Decision Tree

To determine the severity of a finding, follow these steps:

1.  **Can this be exploited immediately without user interaction?**
    - Yes → **Critical**
    - No → Continue

2.  **Does it expose sensitive data (PII, secrets) or allow privilege escalation?**
    - Yes → **High**
    - No → Continue

3.  **Does it require specific conditions or user interaction (e.g., social engineering)?**
    - Yes → **Medium**
    - No → Continue

4.  **Is it a deviation from best practice without an immediate exploit path?**
    - Yes → **Low**
    - No → **Info**

---

## Severity Matrix

| Impact | Exploitability | Severity |
|--------|----------------|----------|
| Full system takeover / Mass data breach | Trivial / Automated | **Critical** |
| Data exposure / Targeted account takeover | Easy / Manual | **High** |
| Limited data access / DoS | Moderate / Requires User | **Medium** |
| Localized impact / Best practice gap | Difficult / Complex | **Low** |
| Informational only / No security impact | N/A | **Info** |

---

## Common Examples

### Critical
- Hardcoded production credentials or signing secrets.
- Unauthenticated access to administrative APIs.
- SQL Injection in public-facing endpoints.

### High
- Cross-Site Scripting (XSS) on authenticated pages.
- Missing authorization checks on sensitive resources (IDOR).
- Weak password hashing (e.g., MD5) for user accounts.

### Medium
- No rate limiting on authentication or heavy API endpoints.
- Missing secure cookie flags (`HttpOnly`, `Secure`).
- Verbose error messages in production.

### Low
- Missing security headers (CSP, HSTS).
- Outdated dependencies without known CVEs.
- Lack of request logging for security events.
