# Access Control Test Cases

Scenarios to test for authorization bypasses and IDOR.

---

## 1. Vertical Escalation
    - [] Login as a regular user.
- [] Attempt to access an endpoint clearly intended for admins(e.g., `/api/admin/users`).
- [] Verify that the server returns `401 Unauthorized` or`403 Forbidden`.

## 2. Horizontal Escalation(IDOR)
    - [] User A creates a resource(e.g., Task ID: 101).
- [] User B logs in.
- [] User B attempts to GET / PUT / DELETE Task ID: 101.
    - [] Verify that the operation fails with `404 Not Found` or`403 Forbidden`.

## 3. Parameter Tampering
    - [] Change a `userId` parameter in a POST body to a different user's ID.
        - [] Verify if the server overrides it with the ID from the session / token.

## 4. Insecure Direct Object Reference(Meta)
    - [] Check if incremental IDs(1, 2, 3...) are used for sensitive resources.
- [] Verify if UUIDs are used to prevent enumeration.
