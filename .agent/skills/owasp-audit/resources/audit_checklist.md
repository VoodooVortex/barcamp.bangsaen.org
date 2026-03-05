# Security Audit Checklist (OWASP Top 10 – 2023)

Use this checklist during security audits. Each item is tagged with a severity level and a verification method (Manual/Automated).

---

## 1. Broken Access Control

- [ ] `[Critical]` `[Manual]` Verify that users cannot access resources belonging to other users (e.g., `/api/tasks/:id` enforces ownership)
- [ ] `[Critical]` `[Manual]` Check that administrative functions are restricted to admin roles only
- [ ] `[High]` `[Manual]` Ensure only authenticated users can access protected routes/dashboards
- [ ] `[High]` `[Automated]` Validate that state-changing operations (DELETE, PUT, POST) verify resource ownership (search for `.where()` clauses)
- [ ] `[Medium]` `[Manual]` Check CORS policy — `Access-Control-Allow-Origin` should not be `*` in production
- [ ] `[Medium]` `[Manual]` Verify that direct object references (IDs in URLs) cannot be enumerated
- [ ] `[Low]` `[Manual]` Ensure directory listing is disabled on the web server

## 2. Cryptographic Failures

- [ ] `[Critical]` `[Automated]` Verify secrets (JWT keys, API keys, DB passwords) are NOT hardcoded in source code (use `secret_scan.sh`)
- [ ] `[Critical]` `[Manual]` Ensure passwords are hashed using strong algorithms (bcrypt cost ≥ 10, argon2, scrypt)
- [ ] `[High]` `[Automated]` Verify that sensitive data is not transmitted in plaintext (check for HTTPS enforcement)
- [ ] `[High]` `[Manual]` Confirm no sensitive information (passwords, tokens) is leaked in logs or error messages
- [ ] `[Medium]` `[Automated]` Check that secrets are loaded from environment variables or a secret manager
- [ ] `[Low]` `[Manual]` Verify that cryptographic algorithms in use are current (no MD5, SHA1 for passwords)

## 3. Injection

- [ ] `[Critical]` `[Automated]` Verify use of parameterized queries or ORM to prevent SQL injection (use `search_patterns.sh`)
- [ ] `[Critical]` `[Automated]` Check for XSS — ensure user data is not rendered via `innerHTML`, `document.write()`, or unescaped templates
- [ ] `[High]` `[Manual]` Check for Command Injection in any logic that calls `exec()`, `spawn()`, or system commands
- [ ] `[High]` `[Manual]` Validate that all user input is type-checked and length-limited on the server
- [ ] `[Medium]` `[Manual]` Ensure HTML entities are escaped when rendering user-generated content

## 4. Insecure Design

- [ ] `[High]` `[Manual]` Ensure fail-secure defaults (deny access by default)
- [ ] `[High]` `[Manual]` Check for rate limiting on authentication endpoints (login, register, password reset)
- [ ] `[Medium]` `[Manual]` Verify account lockout or CAPTCHA after repeated failed login attempts
- [ ] `[Medium]` `[Manual]` Check for business logic flaws (negative values, bypassing validation flows)

## 5. Security Misconfiguration

- [ ] `[High]` `[Automated]` Check for proper HTTP security headers (use `check_headers.sh`):
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `[High]` `[Manual]` Ensure error messages are generic and don't leak stack traces or server internals
- [ ] `[Medium]` `[Manual]` Remove temporary test files, debug endpoints, or default accounts from production
- [ ] `[Low]` `[Automated]` Check that server version headers are suppressed (`X-Powered-By`, `Server`)

## 6. Vulnerable and Outdated Components

- [ ] `[High]` `[Automated]` Run dependency audit (`dependency_audit.sh`)
- [ ] `[Medium]` `[Manual]` Ensure all core libraries and frameworks are on supported versions
- [ ] `[Medium]` `[Manual]` Remove unused dependencies to reduce attack surface

## 7. Identification and Authentication Failures

- [ ] `[High]` `[Manual]` Verify JWT/session tokens have a reasonable expiration time (1-24 hours)
- [ ] `[High]` `[Manual]` Check for minimum password complexity requirements
- [ ] `[High]` `[Manual]` Test that logout properly invalidates or clears session tokens
- [ ] `[Medium]` `[Manual]` Verify that login responses don't reveal whether the username or password was incorrect

## 8. Software and Data Integrity Failures

- [ ] `[High]` `[Manual]` Verify that client-side data is always re-validated on the server
- [ ] `[Medium]` `[Manual]` Check if third-party scripts loaded via CDN include Subresource Integrity (SRI) hashes

## 9. Security Logging and Monitoring Failures

- [ ] `[High]` `[Manual]` Log failed login attempts and unauthorized access requests
- [ ] `[Medium]` `[Manual]` Ensure logs do not contain sensitive user data (passwords, tokens, PII)

## 10. Server-Side Request Forgery (SSRF)

- [ ] `[High]` `[Manual]` Validate all user-supplied URLs or network addresses against an allowlist
- [ ] `[Medium]` `[Manual]` Restrict outbound network access from the application server where possible
- [ ] `[Medium]` `[Automated]` Block requests to private/internal IP ranges (check URL validation logic)
