# Security Audit Report: Prism SPA

An example report for a Single Page Application (SPA) frontend.

---

## Report Header

```
Application:  Prism SPA (React)
Version:      v1.2.1
Audit Date:   2026-02-18
Auditor:      OWASP Audit Skill
Scope:        Frontend Application - XSS, CSP, Session Storage, and Client-side Auth.
```

---

## Executive Summary

The Prism SPA audit focused on client-side security risks. The audit found **3 findings**: 1 High and 2 Medium. The primary risk is the storage of **JWT tokens in localStorage**, which makes them vulnerable to extraction via XSS. The application also lacks a **Content Security Policy (CSP)** to mitigate injection attacks.

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | XSS Vulnerability in Comments | High | A03: Injection | `src/components/Comment.tsx` |
| 2 | Insecure JWT Storage | Medium | A07: Auth Failures | `src/hooks/useAuth.ts` |
| 3 | Missing Content Security Policy | Medium | A05: Security Misconfiguration | `public/index.html` |

---

## Detailed Findings

### Finding 1: XSS in Comment Component

**Severity**: High
**OWASP Category**: A03: Injection
**Location**: `src/components/Comment.tsx`

**Description**:
The application uses `dangerouslySetInnerHTML` to render user comments. This allows an attacker to inject malicious scripts into the page.

**Remediation**:
Avoid using `dangerouslySetInnerHTML`. If HTML must be rendered, use a library like `dompurify` to sanitize the content before rendering.

---

### Finding 2: Insecure JWT Storage

**Severity**: Medium
**OWASP Category**: A07: Auth Failures
**Location**: `src/hooks/useAuth.ts`

**Description**:
JWT tokens are stored in `localStorage`. Unlike `HttpOnly` cookies, `localStorage` is accessible by any script running on the same origin, making tokens vulnerable to theft via XSS.

**Remediation**:
Move the JWT storage to a secure `HttpOnly` cookie.
