# Rust Security Patterns

Vulnerability detection patterns for Rust (Actix, Axum, Rocket).

---

## Injection
- **SQLi**: `sqlx::query(&format!("..."))`
- **Command Injection**: `Command::new("sh").arg("-c").arg(var)`
- **XSS**: `Html(var)` in Axum or Actix without sanitization.

## Broken Access Control
- **Inadequate Authorization**: Guards or Extractors incorrectly configured for permission checks.
- **IDOR**: DB queries that don't bind the user ID from the extractor.

## Security Misconfiguration
- **Insecure TLS**: Using versions of `native-tls` or `rustls` with insecure defaults.
- **Crates**: Use of crates with known security issues in `Cargo.toml`.
