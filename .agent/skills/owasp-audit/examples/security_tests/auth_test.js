# Authentication Test Cases

Scenarios to verify the robustness of the authentication system.

---

## 1. Password Complexity
    - [] Attempt to register with a 1 - character password.
- [] Attempt to register with a common password(e.g., "password123").

## 2. Session Integrity
    - [] Login and capture the cookie / token.
- [] Attempt to use the token after the session should have expired.
- [] Verify that the token is invalidated server - side after logout.

## 3. Brute Force
    - [] Perform 20 rapid login attempts with incorrect credentials.
- [] Verify if the account is locked or if rate limiting(429) triggers.

## 4. Credential Leaks
    - [] Check if the login response contains the hashed password or other sensitive PII.
- [] Verify that password reset tokens are not leaked in the URL or logs.
