# PHP Security Patterns

Vulnerability detection patterns for PHP (Laravel, Symfony, WordPress).

---

## Injection
- **SQLi**: `$db->query("... " . $var)`, `mysql_query()`, `mysqli_query()` without binding.
- **Command Injection**: `system()`, `exec()`, `passthru()`, `shell_exec()`
- **XSS**: `echo $var` without `htmlspecialchars()`.

## Broken Access Control
- **Inadequate Authorization**: Missing middleware like `auth` or `can`.
- **IDOR**: `User::find($id)` used in controllers without checking resource ownership.

## Security Misconfiguration
- **Debug Mode**: `APP_DEBUG=true` in `.env`
- **Display Errors**: `display_errors = On` in `php.ini`
