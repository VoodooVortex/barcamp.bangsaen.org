# Security Audit Report: SwiftPay Mobile Backend

An example report for a mobile application backend API.

---

## Report Header

```
Application:  SwiftPay (Fintech Mobile App)
Version:      API v2.0 (Express/TypeScript)
Audit Date:   2026-02-18
Auditor:      OWASP Audit Skill
Scope:        JWT Handling, Device Fingerprinting, API Versioning, and Data Encryption.
```

---

## Executive Summary

The SwiftPay Mobile Backend audit focused on protecting financial data and managing mobile session life cycles. The audit discovered **4 findings**: 1 Critical, 1 High, and 2 Medium. The most urgent issue is the **long-lived JWT refreshToken** without revocation, which allows stolen credentials to be used indefinitely.

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | No JWT Refresh Token Revocation | Critical | A07: Auth Failures | `src/controllers/auth.ts` |
| 2 | Use of Insecure Encryption Algorithm | High | A02: Crypto Failures | `src/utils/encrypt.ts` |
| 3 | Lack of API Pinning/Fingerprinting | Medium | A04: Insecure Design | `src/app.ts` |
| 4 | Sensitive Info in API Stack Traces | Medium | A05: Security Misconfiguration | `src/middleware/error.ts` |

---

## Detailed Findings

### Finding 1: No JWT Refresh Token Revocation

**Severity**: Critical
**OWASP Category**: A07: Identification and Authentication Failures
**CWE**: CWE-613: Insufficient Session Expiration

**Description**:
The application issues 30-day "refreshToken" values that are not stored in a database or cache. This makes it impossible to revoke a specific session if a device is lost or stolen. The token remains valid until its natural expiration.

**Remediation**:
Implement a "token allowlist" or "denylist" in Redis or a database. On logout or suspected compromise, invalidate the refreshToken entry.

---

### Finding 2: Insecure Encryption Algorithm

**Severity**: High
**OWASP Category**: A02: Cryptographic Failures
**Location**: `src/utils/encrypt.ts`

**Description**:
User financial profile summaries are encrypted using `AES-128-ECB`. ECB mode is insecure for multi-block data as it reveals patterns in the plaintext.

**Remediation**:
Switch to `AES-256-GCM` or `AES-256-CBC` with a unique, random Initialization Vector (IV) for every encryption operation.
