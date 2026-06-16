# Proposal: Security Hardening and Status Update (v2)

## Why
The project was vulnerable to the "React2Shell" (CVE-2025-55182) exploit affecting Next.js 15.1.x and React 19.0.0. This led to malicious execution attempts in the server's RAM and high memory consumption.

## What Changes
- Updated Next.js to 15.1.11 and React/React-DOM to 19.0.3 to close the RCE vulnerability.
- Implemented security monitoring in `middleware.ts` to log malicious IP addresses and paths for unauthorized Server Action attempts.
- Hardened `docker-compose.yml` with memory limits (1GB) and reduced `tmpfs` sizes to prevent resource exhaustion during attacks.
- Configured `Dockerfile` to handle Prisma build requirements without needing the database URL, ensuring stable deployments on resource-constrained servers.

## Capabilities
### New Capabilities
- **Security Monitoring**: Middleware now logs IP and path for suspicious requests, enabling proactive blocking.
- **Resource Governance**: Docker resource limits now prevent a compromised or stressed container from crashing the host server.

### Modified Capabilities
- **Deployment Stability**: Build process now handles environment variable requirements gracefully.

## Impact
- `package.json`: Updated core dependencies (Next.js, React).
- `src/middleware.ts`: Added security logging layer.
- `docker-compose.yml`: Added resource limits and optimized temporary file systems.
- `Dockerfile`: Updated build environment for better separation of build and runtime concerns.
