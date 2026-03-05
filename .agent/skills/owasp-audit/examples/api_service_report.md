# Security Audit Report: Nexus API Service

An example report for a RESTful API service.

---

## Report Header

```
Application:  Nexus API Service
Version:      v2.4.0
Audit Date:   2026-02-18
Auditor:      OWASP Audit Skill
Scope:        Backend API - Authentication, Rate Limiting, CORS, and Data Validation.
```

---

## Executive Summary

The Nexus API service was audited with a focus on API-specific vulnerabilities. The audit identified **4 findings**: 1 High, 2 Medium, and 1 Low. The most significant concern is a **permissive CORS policy** that allows any origin to interact with the API. Additionally, key endpoints lack **rate limiting**, increasing the risk of denial-of-service or brute-force attacks.

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | Permissive CORS Policy | High | A01: Broken Access Control | `src/middleware/cors.ts` |
| 2 | Missing Rate Limiting on API | Medium | A04: Insecure Design | `src/routes/api.ts` |
| 3 | Excessive Data Exposure | Medium | A01: Broken Access Control | `src/models/user.ts` |
| 4 | Missing Security Headers | Low | A05: Security Misconfiguration | `src/app.ts` |

---

## Detailed Findings

### Finding 1: Permissive CORS Policy

**Severity**: High
**OWASP Category**: A01: Broken Access Control
**Location**: `src/middleware/cors.ts`

**Description**:
The API current allows `Access-Control-Allow-Origin: *`. This allow any website to make requests to the API and read responses, which could lead to unauthorized data access if the API relies on ambient credentials.

**Remediation**:
Restrict the allowed origins to a specific allowlist of trusted domains.

---

### Finding 2: Missing Rate Limiting

**Severity**: Medium
**OWASP Category**: A04: Insecure Design
**Location**: `src/routes/api.ts`

**Description**:
Public API endpoints do not have rate limiting. This allows stakeholders or malicious actors to overwhelm the service with requests.

**Remediation**:
Implement a rate-limiting middleware (e.g., `express-rate-limit`) on all public routes.
