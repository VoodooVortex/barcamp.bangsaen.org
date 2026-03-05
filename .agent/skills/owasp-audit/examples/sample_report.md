# Sample Security Audit Report: Taskly (Task Manager)

This is a completed example using the report template. It demonstrates how to document findings from an audit of the `task-manager` application in this project.

---

## Report Header

```
Application:  Taskly (Task Manager)
Version:      Initial commit
Audit Date:   2026-02-18
Auditor:      OWASP Audit Skill (automated)
Scope:        Full-stack — backend (src/index.ts), frontend (public/), schema (src/schema.ts)
```

---

## Executive Summary

The Taskly application was audited against the OWASP Top 10 (2023) framework. The audit identified **6 findings**: 1 Critical, 2 High, 2 Medium, and 1 Low. The most urgent issue is a **hardcoded JWT secret** in the source code, which would allow any attacker with access to the repository to forge authentication tokens. The application also has **XSS vulnerabilities** through the use of `innerHTML` and **no security headers** configured. Overall, the application requires immediate remediation before production deployment.

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | Hardcoded JWT Secret | Critical | A02: Cryptographic Failures | `src/index.ts:8` |
| 2 | XSS via innerHTML | High | A03: Injection | `public/app.js:152-153` |
| 3 | Verbose Error Messages | High | A05: Security Misconfiguration | `src/index.ts:108` |
| 4 | No Rate Limiting on Auth | Medium | A04: Insecure Design | `src/index.ts:29-51` |
| 5 | Missing Security Headers | Medium | A05: Security Misconfiguration | `src/index.ts` (global) |
| 6 | No Input Validation | Low | A03: Injection | `src/index.ts:30,77` |

---

## Detailed Findings

### Finding 1: Hardcoded JWT Secret

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **OWASP Category** | A02: Cryptographic Failures |
| **Location** | `src/index.ts:8` |
| **CWE** | CWE-259 (Hardcoded Password) |

**Description**:
The JWT signing secret is hardcoded as a string literal in the source code. Anyone with access to the repository can use this secret to forge valid JWT tokens and impersonate any user.

**Evidence**:
```typescript
const JWT_SECRET = new TextEncoder().encode("your-secret-key");
// Comment says: "In a real app, use environment variables"
```

**Remediation**:
```typescript
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is required"); })()
);
```

**Priority**: Immediate

---

### Finding 2: XSS via innerHTML

| Field | Value |
|-------|-------|
| **Severity** | High |
| **OWASP Category** | A03: Injection |
| **Location** | `public/app.js:152-153` |
| **CWE** | CWE-79 (Cross-Site Scripting) |

**Description**:
The task rendering function uses `innerHTML` with interpolated task data. If a user creates a task with a title like `<img src=x onerror=alert(1)>`, the JavaScript will execute in the browser of anyone viewing that task.

**Evidence**:
```javascript
card.innerHTML = `
    <h4>${task.title}</h4>
    <p>${task.description || 'No description'}</p>
    ...
`;
```

**Remediation**:
```javascript
const h4 = document.createElement('h4');
h4.textContent = task.title;
const p = document.createElement('p');
p.textContent = task.description || 'No description';
card.appendChild(h4);
card.appendChild(p);
```

**Priority**: Immediate

---

### Finding 3: Verbose Error Messages

| Field | Value |
|-------|-------|
| **Severity** | High |
| **OWASP Category** | A05: Security Misconfiguration |
| **Location** | `src/index.ts:108` |
| **CWE** | CWE-209 (Information Exposure via Error Message) |

**Description**:
The catch block returns the raw error message to the client, which may contain stack traces, file paths, or database details that help an attacker understand the server internals.

**Evidence**:
```typescript
catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
}
```

**Remediation**:
```typescript
catch (error: any) {
    console.error(error); // Log internally
    return Response.json({ error: "Internal Server Error" }, { status: 500 }); // Generic message
}
```

**Priority**: Short-term

---

### Finding 4: No Rate Limiting on Authentication

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **OWASP Category** | A04: Insecure Design |
| **Location** | `src/index.ts:29-51` |
| **CWE** | CWE-307 (Improper Restriction of Excessive Authentication Attempts) |

**Description**:
The login and registration endpoints have no rate limiting. An attacker could make unlimited login attempts to brute-force user passwords, or spam the registration endpoint to fill the database.

**Evidence**:
The `/api/login` and `/api/register` routes handle every request without tracking request frequency.

**Remediation**:
Implement a rate limiter (e.g., in-memory map or library) that limits to ~5 attempts per IP per minute on auth endpoints.

**Priority**: Short-term

---

### Finding 5: Missing Security Headers

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **OWASP Category** | A05: Security Misconfiguration |
| **Location** | `src/index.ts` (global) |
| **CWE** | CWE-16 (Configuration) |

**Description**:
No HTTP security headers are set on any response. This leaves the application vulnerable to clickjacking (no X-Frame-Options), MIME-type sniffing (no X-Content-Type-Options), and other browser-level attacks.

**Evidence**:
No response header configuration found anywhere in the server code.

**Remediation**:
Add a middleware or wrapper that sets headers on every response:
```typescript
headers: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

**Priority**: Short-term

---

### Finding 6: No Input Validation

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **OWASP Category** | A03: Injection |
| **Location** | `src/index.ts:30,77` |
| **CWE** | CWE-20 (Improper Input Validation) |

**Description**:
User input from `req.json()` is used directly without validating type, length, or format. Registration accepts empty usernames/passwords, and tasks accept titles of any length.

**Evidence**:
```typescript
const { username, password } = await req.json();  // No validation
const { title, description } = await req.json();  // No validation
```

**Remediation**:
Add input validation before processing:
```typescript
const { username, password } = await req.json();
if (!username || typeof username !== 'string' || username.length < 3 || username.length > 50) {
    return Response.json({ error: "Username must be 3-50 characters" }, { status: 400 });
}
if (!password || typeof password !== 'string' || password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
}
```

**Priority**: Long-term

---

## Recommendations Summary

### Immediate (fix before deployment)
1. Move JWT secret to environment variable (Finding 1)
2. Replace `innerHTML` with safe DOM APIs (Finding 2)

### Short-term (fix within 1-2 sprints)
3. Return generic error messages only (Finding 3)
4. Add rate limiting to auth endpoints (Finding 4)
5. Configure security headers on all responses (Finding 5)

### Long-term (improve over time)
6. Add server-side input validation with length/type checks (Finding 6)

---

## Appendix

- **Tools Used**: Manual code review, `bun pm audit`
- **Scope Limitations**: No runtime testing was performed (app was not started). Database contents were not inspected.
- **References**:
  - [OWASP Top 10 2021](https://owasp.org/Top10/)
  - [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
