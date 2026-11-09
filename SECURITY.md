# Security Policy

The **JewelCore ERP** team takes the security of our precious asset ledger, physical custody protocols, and statutory compliance engines with utmost priority.

## Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability or potential risk in JewelCore ERP (including cryptographic bypasses, PBAC authorization flaws, SQL injection risks, hardware telemetry spoofing, or statutory ledger inaccuracies), please disclose it responsibly:

1. **Email**: Send your findings directly to **[security@jewelcore.internal](mailto:security@jewelcore.internal)** or open a private GitHub Security Advisory under the repository's **Security** tab.
2. **Details to Include**:
   - Component affected (`@jewelcore/web`, `@jewelcore/api`, `@jewelcore/database`, etc.)
   - Vulnerability category (e.g., NIST SP 800-63B Auth, BIS HUID validation, SQL injection, dual-custody bypass)
   - Step-by-step reproduction instructions or proof-of-concept (PoC)
   - Proposed mitigation or remediation patch (if available)

## Response Timeline & SLA

- **Initial Acknowledgment**: Within 24 hours of receipt.
- **Triage & Assessment**: Within 48 hours to validate severity and determine CVSS score.
- **Remediation & Patch**: Target delivery of a hotfix release within 5 business days for critical findings.
- **Public Disclosure**: Coordinated public disclosure only after an official patch release has been published.

## Security Engineering Principles

JewelCore ERP adheres to defense-in-depth principles:
- **Zero-Trust Workstation Governance**: Policy-Based Access Control (PBAC) with hardware token device binding (AAL3).
- **Dual-Custody Physical Vault Quorum**: Two-person authorization rule for high-value vault transfers and emergency overrides.
- **Strict Parameterization**: 100% parameterized SQL queries via `$1, $2, ...` placeholders preventing injection vulnerabilities.
- **Statutory Audit Trails**: Append-only cryptographic Merkle audit records with automated database triggers.
