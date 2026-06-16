# Tasks: Security Hardening (v2)

## 1. Dependency Updates
- [x] 1.1 Update `package.json` with Next.js 15.1.11 and React 19.0.3.
- [x] 1.2 Verify dependency consistency.

## 2. Application Hardening
- [x] 2.1 Implement IP and path logging in `middleware.ts`.
- [x] 2.2 Fix TypeScript errors in middleware headers access.

## 3. Infrastructure Hardening
- [x] 3.1 Set memory limits in `docker-compose.yml`.
- [x] 3.2 Reduce `tmpfs` sizes to conserve RAM.
- [x] 3.3 Configure dummy database URL in `Dockerfile` for build stability.

## 4. Verification & Deployment
- [x] 4.1 Perform full rebuild and redeploy.
- [x] 4.2 Verify Server Action "x" is rejected in logs.
- [x] 4.3 Confirm Next.js version in startup logs.
- [x] 4.4 Block known malicious IP `87.121.84.24` via host firewall.
