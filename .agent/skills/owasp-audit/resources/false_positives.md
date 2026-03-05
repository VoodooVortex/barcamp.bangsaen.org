# False Positive Guidance

Security tools often produce "noise." Use this guide to identify and filter false positives during an audit.

---

## Definition of a False Positive

A finding is a false positive if:
1.  The code is unreachable or dormant.
2.  The "vulnerability" is actually intended business logic.
3.  The risk is already mitigated by an upstream or downstream control.
4.  The finding is in test or mockup code.

---

## Common False Positives by Category

### Hardcoded Secrets
- **Test Credentials**: Hardcoded strings in `test/`, `spec/`, or `mock/` files.
- **Example Data**: Variable assignments in documentation or `README.md`.
- **Placeholder Values**: Strings like `"your-api-key-here"`.
- **Action**: Verify if the secret is used in production configuration.

### XSS via innerHTML
- **Static Content**: Setting `innerHTML` to a hardcoded string constant.
- **Sanitized Data**: Data that has already passed through `DOMPurify` or similar.
- **Action**: Check the source of the data variable. If it's a fixed string, it's not a vulnerability.

### Missing Security Headers
- **Upstream Proxy**: Headers like `HSTS` or `CSP` are often set by Nginx, Cloudflare, or an AWS Load Balancer.
- **Action**: Check infrastructure configuration files if available.

### SQL Injection
- **Internal Constants**: Queries using variables that are defined as constants within the code.
- **Action**: Trace the variable back to its origin. If it never touches user input, it's safe.

---

## Verification Steps before Reporting

1.  **Check Path**: Is this file part of the production build?
2.  **Trace Data**: Where does the input come from? (User → Controller → Model?)
3.  **Search for Sanitizers**: Are there any functions like `escape()`, `sanitize()`, or `encode()` used on the data?
4.  **Confirm Exploitability**: Can you describe a plausible attack scenario? If not, it's likely Low severity or a False Positive.
