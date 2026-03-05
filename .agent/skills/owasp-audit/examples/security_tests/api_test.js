# API Security Test Cases

Tests for API - specific vulnerabilities.

---

## 1. Content - Type Validation
    - [] Send a POST request with `Content-Type: text/plain` but JSON body.
- [] Verify if the server rejects it or treats it as JSON without validation.

## 2. Mass Assignment
    - [] In a profile update request, include a field you shouldn't be able to change (e.g., `"role": "admin"`).
        - [] Verify if the field is updated in the database.

## 3. CORS bypass
    - [] Send an `Origin` header from a non - whitelisted domain.
- [] Verify if the response contains`Access-Control-Allow-Origin: *`.

## 4. SSRF
    - [] Find an endpoint that fetches remote data.
- [] Provide a URL for an internal service(e.g., `http://localhost:8080/admin`).
- [] Verify if the server attempts the request.
