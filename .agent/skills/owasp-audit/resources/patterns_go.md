# Go Security Patterns

Vulnerability detection patterns for GoLang (Gin, Echo, Standard Library).

---

## Injection
- **SQLi**: `fmt.Sprintf("SELECT ... %s", var)`, `db.Query(queryWithVar)`
- **Command Injection**: `exec.Command("sh", "-c", var)`, `os.StartProcess()`
- **XSS**: `template.HTML(var)` or writing unescaped strings to `http.ResponseWriter`.

## Broken Access Control
- **Inadequate Authorization**: Routes not using specific auth middleware.
- **IDOR**: Fetching records by ID without checking the claims in the `JWT` or `Context`.

## Security Misconfiguration
- **Insecure Randomness**: `math/rand` instead of `crypto/rand` for security contexts.
- **HTTP/TLS**: `tls.Config{InsecureSkipVerify: true}`
