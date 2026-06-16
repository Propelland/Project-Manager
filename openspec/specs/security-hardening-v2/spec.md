# security-hardening-v2 Specification

## Purpose
TBD - created by archiving change security-hardening-v2. Update Purpose after archive.
## Requirements
### Requirement: Prevention of Remote Code Execution (RCE)
The system MUST be updated to versions that patch the "React2Shell" (CVE-2025-55182) vulnerability.

#### Scenario: Malicious Server Action Attempt
- **WHEN** an unauthenticated user attempts to execute an unauthorized Server Action ("x")
- **THEN** Next.js MUST reject the request without executing any malicious instructions.
- **AND** the incident MUST be logged for monitoring.

### Requirement: Resource Limitation (DoS Mitigation)
The container MUST NOT consume all host resources even if under heavy attack.

#### Scenario: Memory Growth during Attack
- **WHEN** multiple concurrent attacks attempt to consume RAM in the container
- **THEN** Docker MUST limit the container's memory to 1GB.
- **AND** the container MUST be restarted if it reaches this limit (unless-stopped).

### Requirement: IP Tracking
Security monitoring MUST identify the source of suspicious requests.

#### Scenario: Attack Log with IP
- **WHEN** a request contains "lrt" or "NaN" in its path (indicators of the known exploit)
- **THEN** the middleware MUST log the IP and path of the request.
- **AND** the log MUST be visible via `docker compose logs`.

