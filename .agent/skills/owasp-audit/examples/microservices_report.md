# Security Audit Report: EcoSystem Microservices

An example report evaluating a distributed microservices architecture.

---

## Report Header

```
Application:  EcoSystem (Inventory & Order Services)
Architecture: Microservices (Node.js & Go)
Audit Date:   2026-02-18
Auditor:      OWASP Audit Skill
Scope:        Inter-service Authentication, SSRF, Centralized Logging, and API Gateway.
```

---

## Executive Summary

The EcoSystem microservices audit focused on service-to-service communication and perimeter security. The audit identified **5 findings**: 2 High, 2 Medium, and 1 Info. The primary critical risk involves **unauthenticated inter-service calls** within the internal network, which could allow a compromised service to pivot across the entire infrastructure.

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | Lack of Inter-service Authentication | High | A07: Auth Failures | Internal VPC / All Services |
| 2 | Potential SSRF in PDF Generator | High | A10: SSRF | `inventory-service/utils/pdf.go` |
| 3 | Insecure Service Registry Config | Medium | A05: Security Misconfiguration | `consul/config.json` |
| 4 | Distributed Logging Privacy Leak | Medium | A09: Logging Failures | `order-service/middleware/logger.js` |
| 5 | Shared Database Credentials | Info | A05: Security Misconfiguration | `.env.production` |

---

## Detailed Findings

### Finding 1: Lack of Inter-service Authentication

**Severity**: High
**OWASP Category**: A07: Identification and Authentication Failures
**CWE**: CWE-306: Missing Authentication for Critical Function

**Description**:
The Order service calls the Inventory service using internal IPs without any form of authentication (mTLS, JWT, or API Keys). While the VPC restricts external access, an attacker who gains a foothold in any service can manipulate other services without restriction.

**Remediation**:
Implement mTLS (Mutual TLS) between all services or use a centralized Service Mesh (like Istio) to enforce identity-based authorization.

---

### Finding 2: Potential SSRF in PDF Generator

**Severity**: High
**OWASP Category**: A10: SSRF
**Location**: `inventory-service/utils/pdf.go`

**Description**:
The inventory service allows users to generate PDFs from a provided URL. The URL is not validated against a whitelist, potentially allowing an attacker to probe internal services (e.g., `http://order-db:5432`).

**Remediation**:
Implement a strict whitelist of allowed domains and block access to private IP ranges (10.x.x.x, 172.x.x.x, 192.168.x.x).
