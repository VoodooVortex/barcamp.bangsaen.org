# OWASP Top 10 – 2023 Reference

A detailed reference for each of the OWASP Top 10 categories. Use this alongside the `audit_checklist.md` when performing security reviews.

---

## 1. Broken Access Control

**Risk**: Users can act outside their intended permissions — accessing other users' data, modifying records they don't own, or escalating to admin privileges.

**CWE References**: CWE-200, CWE-284, CWE-285, CWE-639

**Common Attack Vectors**:
- Modifying URL parameters (e.g., `/api/tasks/5` → `/api/tasks/6`) to access another user's resource
- Missing authorization checks on state-changing operations (PUT, DELETE)
- Accessing admin endpoints without role verification
- CORS misconfiguration allowing cross-origin requests

**Mitigations**:
- Deny access by default; require explicit authorization
- Enforce ownership checks on every data operation (e.g., `WHERE userId = ?`)
- Implement role-based access control (RBAC)
- Disable directory listing and restrict access to metadata files (`.git`, `.env`)

---

## 2. Cryptographic Failures

**Risk**: Sensitive data (passwords, tokens, PII) is exposed due to weak, missing, or improperly implemented cryptography.

**CWE References**: CWE-259, CWE-327, CWE-328, CWE-331

**Common Attack Vectors**:
- Passwords stored as plaintext or with weak hashing (MD5, SHA1)
- Secrets (JWT keys, API keys, DB passwords) hardcoded in source code
- Sensitive data transmitted over HTTP instead of HTTPS
- Secrets leaked in logs, error messages, or API responses

**Mitigations**:
- Hash passwords with bcrypt, scrypt, or Argon2 (cost factor ≥ 10)
- Store all secrets in environment variables or a secret manager
- Enforce HTTPS/TLS for all data in transit
- Audit logs and error handlers to ensure no sensitive data leaks

---

## 3. Injection

**Risk**: Untrusted input is sent to an interpreter (SQL, NoSQL, OS, LDAP) as part of a command or query, allowing attackers to execute unintended operations.

**CWE References**: CWE-20, CWE-79, CWE-89, CWE-78

**Common Attack Vectors**:
- SQL Injection via string concatenation in queries
- Cross-Site Scripting (XSS) via `innerHTML`, `document.write()`, or unescaped template output
- Command Injection via `exec()`, `spawn()`, or `system()` with user input
- NoSQL Injection via unvalidated query objects

**Mitigations**:
- Use parameterized queries or ORM (Drizzle, Prisma, SQLAlchemy)
- Sanitize and escape all user input before rendering in HTML
- Use `textContent` instead of `innerHTML` for user-supplied data
- Validate input type, length, and format on the server side
- Use allowlists (not blocklists) for command arguments

---

## 4. Insecure Design

**Risk**: Architectural and design flaws that cannot be fixed by implementation alone — missing threat modeling, unsafe defaults, or lack of security controls.

**CWE References**: CWE-209, CWE-256, CWE-501, CWE-522

**Common Attack Vectors**:
- No rate limiting on login/registration endpoints (brute force)
- Missing account lockout after failed attempts
- Business logic flaws (e.g., negative quantities, bypassing payment)
- No principle of least privilege in system design

**Mitigations**:
- Implement rate limiting on authentication endpoints
- Design with fail-secure defaults (deny by default)
- Conduct threat modeling during design phase
- Apply defense-in-depth (multiple layers of security controls)

---

## 5. Security Misconfiguration

**Risk**: Improperly configured servers, frameworks, or cloud services leaving exploitable gaps.

**CWE References**: CWE-2, CWE-11, CWE-16, CWE-388

**Common Attack Vectors**:
- Default credentials left unchanged
- Verbose error messages exposing stack traces, file paths, or DB details
- Missing security headers (CSP, HSTS, X-Frame-Options)
- Unnecessary features enabled (directory listing, debug mode, test endpoints)
- Permissive CORS policies (`Access-Control-Allow-Origin: *`)

**Mitigations**:
- Set security headers: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`
- Return generic error messages to clients; log details server-side only
- Remove test files, debug endpoints, and default accounts before production
- Review CORS configuration to restrict allowed origins

---

## 6. Vulnerable and Outdated Components

**Risk**: Using libraries, frameworks, or runtime versions with known security vulnerabilities.

**CWE References**: CWE-1035, CWE-1104

**Common Attack Vectors**:
- Using npm packages with known CVEs
- Outdated framework versions missing security patches
- Transitive dependencies with vulnerabilities
- No automated dependency monitoring

**Mitigations**:
- Run `npm audit` / `bun pm audit` / `pip audit` regularly
- Enable automated dependency update tools (Dependabot, Renovate)
- Remove unused dependencies to reduce attack surface
- Pin dependency versions and review updates before merging

---

## 7. Identification and Authentication Failures

**Risk**: Weak authentication mechanisms allowing attackers to impersonate users, brute-force credentials, or hijack sessions.

**CWE References**: CWE-255, CWE-287, CWE-384, CWE-613

**Common Attack Vectors**:
- No minimum password complexity requirements
- JWT tokens without expiration or with excessively long lifetimes
- Session tokens not invalidated on logout
- Credentials sent over unencrypted connections
- Missing multi-factor authentication on critical accounts

**Mitigations**:
- Enforce password complexity (minimum length, character types)
- Set reasonable JWT/session expiration (e.g., 1-24 hours)
- Invalidate tokens server-side on logout
- Implement account lockout or CAPTCHA after failed attempts
- Use secure, httpOnly, sameSite cookies for session tokens

---

## 8. Software and Data Integrity Failures

**Risk**: Code and data integrity not verified, allowing tampering through insecure CI/CD pipelines, unsigned updates, or unvalidated deserialization.

**CWE References**: CWE-345, CWE-353, CWE-426, CWE-494

**Common Attack Vectors**:
- Loading third-party scripts without Subresource Integrity (SRI) hashes
- Client-side validation without server-side re-validation
- Insecure deserialization of user-supplied objects
- CI/CD pipeline without integrity verification

**Mitigations**:
- Add SRI hashes to all CDN-loaded scripts and stylesheets
- Always validate/sanitize data on the server, regardless of client-side checks
- Verify integrity of packages and dependencies
- Use signed commits and verified build pipelines

---

## 9. Security Logging and Monitoring Failures

**Risk**: Insufficient logging prevents detection of breaches, unauthorized access, or suspicious activity.

**CWE References**: CWE-117, CWE-223, CWE-532, CWE-778

**Common Attack Vectors**:
- No logging of authentication events (login, failed attempts, logout)
- Sensitive data (passwords, tokens) written to logs
- Logs not monitored or alerted on
- No audit trail for data modifications

**Mitigations**:
- Log all authentication events, access control failures, and server-side validation failures
- Ensure logs never contain passwords, tokens, or PII
- Implement log monitoring and alerting for anomalies
- Use structured logging (JSON) for easier parsing and analysis

---

## 10. Server-Side Request Forgery (SSRF)

**Risk**: An attacker tricks the server into making HTTP requests to unintended internal or external destinations.

**CWE References**: CWE-918

**Common Attack Vectors**:
- URL parameters used to fetch remote resources without validation
- Redirects that can be hijacked to reach internal services
- Cloud metadata endpoints (e.g., `169.254.169.254`) accessible from application

**Mitigations**:
- Validate and sanitize all user-supplied URLs
- Use allowlists for permitted domains/IP ranges
- Block requests to private/internal IP ranges
- Disable HTTP redirects or validate redirect targets
