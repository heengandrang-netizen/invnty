# StockSync Pro v18.2.2 — Actual Count Hotfix QA

## Reported defect
Actual Stock user could reach the Actual Count screen but no inventory was available for counting when there was no open physical-count session. The UI treated the missing session as a hard prerequisite and hid the Item Master inventory entirely.

## Root cause
The `actualView()` renderer returned early whenever `countSessions` contained no `status: open` document. This made an operational prerequisite look like missing inventory. Startup also did not distinguish between “data still loading”, “permission/load failure”, “no active items”, and “no open session”.

## Fixes
- Added explicit readiness state for Item Master and Count Sessions before evaluating the workspace.
- Added explicit subscription error state so Firestore permission/network errors no longer look like empty inventory.
- Actual Stock user now auto-creates a restricted shared daily count session if none is open.
- Auto-session IDs are deterministic by day/sequence (`auto-YYYYMMDD-N`) to reduce concurrent duplicate creation.
- Firestore rules permit Actual users to create only tightly scoped auto-session documents with server timestamp and self `createdBy`; update/delete remains Master-only.
- Added clear retry UI if auto-session creation is blocked.
- Added “no active inventory items” state distinct from session/load errors.
- Service-worker cache bumped to v18.2.2.

## Validation
- JavaScript module syntax: PASS
- Service worker syntax: PASS
- Manifest / firebase JSON parse: PASS
- 17/17 targeted hotfix assertions: PASS
- Firestore rule primitives used (`String.matches`, `keys().hasOnly`, `request.time`) verified against official Firebase documentation.

## Deployment requirement
Deploy `firestore.rules` together with the site files. The v18.2.2 frontend can display the exact error if the rule deployment is missing, but automatic session creation will be denied until the included rules are published.
