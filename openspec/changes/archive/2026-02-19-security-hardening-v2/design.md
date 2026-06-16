# Design: Security Hardening (v2)

## Context
The application was targeted by automated botnets exploiting a 0-day vulnerability in React Server Components. While the `read_only` filesystem provided initial protection against persistence, the RCE vulnerability allowed malicious execution in RAM, leading to memory exhaustion and potential data exfiltration.

## Goals
- Close the RCE vulnerability at the application level.
- Provide visibility into ongoing attack attempts.
- Prevent host system instability through resource limits.

## Decisions

### Decision 1: Version Upgrade
Upgrade `next` to `15.1.11` and `react`/`react-dom` to `19.0.3`. This is the primary fix for CVE-2025-55182.

### Decision 2: Middleware-based Logging
Implement a security layer in `middleware.ts` that intercepts requests. 
- **Rationale**: Provides early detection of bot traffic before it reaches complex application logic.
- **Tradeoff**: Slight overhead for every request, but negligible compared to security benefits.

### Decision 3: Docker Resource Constraints
Add `deploy.resources.limits.memory: 1G` to `docker-compose.yml`.
- **Rationale**: Acts as a safety net if a new vulnerability is exploited or if existing attacks cause memory leaks.

### Decision 4: Build-time Stability
Introduce a dummy `DATABASE_URL` during the Docker build stage.
- **Rationale**: Prisma Client requires a connection string during build-time checks, but the real URL should not be baked into the image.
