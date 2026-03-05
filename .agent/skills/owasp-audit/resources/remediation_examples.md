# Remediation Code Examples

This resource provides "Vulnerable vs. Secure" comparisons for common security issues.

---

## A01: Broken Access Control

### Input-based Resource Access (IDOR)

**Vulnerable**:
```typescript
app.get("/api/tasks/:id", async (req, res) => {
  const task = await db.select().from(tasks).where(eq(tasks.id, req.params.id));
  res.json(task);
});
```

**Secure**:
```typescript
app.get("/api/tasks/:id", async (req, res) => {
  // Always include userId condition from session/token
  const task = await db.select().from(tasks)
    .where(and(eq(tasks.id, req.params.id), eq(tasks.userId, req.user.id)));
  
  if (!task.length) return res.status(404).json({ error: "Not found" });
  res.json(task[0]);
});
```

---

## A02: Cryptographic Failures

### Insecure Password Storage

**Vulnerable**:
```javascript
const crypto = require('crypto');
const hash = crypto.createHash('md5').update(password).digest('hex');
// MD5 is broken and too fast for password hashing
```

**Secure**:
```javascript
const bcrypt = require('bcryptjs');
const hashed = await bcrypt.hash(password, 12); // Use cost factor >= 10
```

---

## A03: Injection

### SQL Injection

**Vulnerable**:
```javascript
const query = `SELECT * FROM users WHERE username = '${username}'`;
db.execute(query);
```

**Secure**:
```javascript
// Use parameterized queries (automatically handled by most ORMs)
db.select().from(users).where(eq(users.username, username));
// OR if using raw SQL:
db.execute("SELECT * FROM users WHERE username = ?", [username]);
```

### Cross-Site Scripting (XSS)

**Vulnerable**:
```javascript
element.innerHTML = `<div>Welcome, ${user.name}</div>`;
```

**Secure**:
```javascript
// Use textContent for plain text
element.textContent = `Welcome, ${user.name}`;
// OR use a sanitization library
element.innerHTML = DOMPurify.sanitize(`<div>Welcome, ${user.name}</div>`);
```

---

## A05: Security Misconfiguration

### Generic Error Handling

**Vulnerable**:
```javascript
try {
  // ... logic
} catch (e) {
  res.status(500).json({ error: e.stack }); // Leaks internals
}
```

**Secure**:
```javascript
try {
  // ... logic
} catch (e) {
  console.error(e); // Log detailed error server-side
  res.status(500).json({ error: "Internal Server Error" }); // Generic response
}
```

---

## A07: Identification and Authentication Failures

### JWT Signing

**Vulnerable**:
```javascript
const token = jwt.sign({ id: user.id }, 'static_secret_key');
```

**Secure**:
```javascript
// Read from environment variable
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { 
  expiresIn: '1h', // Set short expiration
  algorithm: 'HS256' 
});
```
