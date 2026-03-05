# TypeScript Security Patterns

Vulnerability detection patterns for TypeScript and Node.js/Bun ecosystems.

---

## Injection
- **XSS (React)**: `dangerouslySetInnerHTML`
- **XSS (Vanilla)**: `.innerHTML`, `document.write(`
- **SQLi**: `db.execute(`, `db.run(`, `${}` inside query strings
- **Command Injection**: `child_process.exec(`, `child_process.spawn(`, `sh.exec(`

## Broken Access Control
- **Inadequate Authorization**: Missing `@Authorized()` decorator or auth middleware on sensitive routes.
- **IDOR**: `findOne({ id: req.params.id })` without a `userId` check.

## Security Misconfiguration
- **Insecure JWT**: `jwt.sign(payload, "secret")`
- **Dev mode in Production**: `process.env.NODE_ENV !== 'production'`
- **Verbose Errors**: `res.status(500).send(err.stack)`
