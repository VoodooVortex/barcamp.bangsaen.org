# Python Security Patterns

Vulnerability detection patterns for Python ecosystems (FastAPI, Django, Flask).

---

## Injection
- **SQLi**: `execute("... %s" % var)`, `f"SELECT ... {var}"`
- **Command Injection**: `os.system()`, `subprocess.call()`, `subprocess.Popen(..., shell=True)`
- **XSS (Jinja2)**: `| safe` filter usage on untrusted data.

## Broken Access Control
- **Inadequate Authorization**: Missing `@login_required` or permission-check decorators.
- **IDOR**: `User.objects.get(id=pk)` without verifying ownership in Django.

## Security Misconfiguration
- **Debug Mode**: `DEBUG = True` in `settings.py` or `app.run(debug=True)`
- **Insecure Cookie**: `set_cookie(..., httponly=False, secure=False)`
