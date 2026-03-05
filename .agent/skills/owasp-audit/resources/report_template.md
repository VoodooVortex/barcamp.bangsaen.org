# Security Audit Report Template

Use this template when producing audit reports. Fill in each section with findings from the audit. See `examples/sample_report.md` for a completed example.

---

## Report Header

```
Application:  [Application name]
Version:      [Version or commit hash]
Audit Date:   [YYYY-MM-DD]
Auditor:      [Agent / Reviewer name]
Scope:        [What was audited — backend, frontend, full-stack, specific feature]
```

---

## Executive Summary

Provide a brief (3-5 sentence) overview of the audit:
- Total number of findings by severity
- Overall risk assessment (Critical / High / Medium / Low)
- Key areas of concern
- Overall assessment of the application's security posture

---

## Findings Summary

| # | Title | Severity | OWASP Category | Location |
|---|-------|----------|----------------|----------|
| 1 | [Finding title] | Critical/High/Medium/Low/Info | A01-A10 | `file:line` |
| 2 | ... | ... | ... | ... |

---

## Detailed Findings

For each finding, use the following structure:

### Finding [#]: [Title]

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low / Info |
| **CVSS v3.1** | [Score (e.g., 9.8)] - Vector: [Vector String] |
| **OWASP Category** | A0X: [Category Name] |
| **Location** | `path/to/file.ts:LINE` |
| **CWE** | CWE-XXX |

**Description**:
Explain the vulnerability — what it is, why it matters, and how an attacker could exploit it.

**Evidence**:
```
[Show the vulnerable code snippet]
```

**Remediation**:
```
[Show the fixed code or describe the fix]
```

**Remediation Timeline**: [Immediate (24h) / Short-term (1w) / Medium-term (1m) / Long-term (3m)]
**Priority**: [Immediate / Short-term / Long-term]

---

## Recommendations Summary

Prioritized list of fixes grouped by urgency:

### Immediate (fix before deployment)
1. [Critical/High findings]

### Short-term (fix within 1-2 sprints)
1. [Medium findings]

### Long-term (improve over time)
1. [Low/Info findings]

---

## Appendix

- **Tools Used**: List any tools or commands run during the audit
- **Scope Limitations**: Note anything that was NOT audited or could not be checked
- **References**: Links to relevant OWASP pages, CWE entries, or documentation
