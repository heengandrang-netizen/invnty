# StockSync Pro v18.2.2 — Actual Count Inventory Hotfix

## Fixed
- Actual Stock users no longer see an empty/non-countable workspace merely because a Master has not manually started a count session.
- The app waits for both Item Master and Count Session subscriptions before deciding whether a session is missing. This avoids startup race conditions and accidental duplicate auto-sessions.
- If there is no open count session, an Actual Stock user automatically starts a shared daily count session and proceeds directly to the inventory count workspace.
- Firestore rules allow Actual Stock users to create only tightly-scoped auto count-session documents; session update/delete remains Master-only.
- Inventory or Count Session subscription failures are surfaced in the UI instead of looking like an empty inventory.
- If auto-session creation fails, the Actual user gets an explicit error and Retry action.
- Service-worker cache key bumped so the fixed UI replaces the cached v18.2.1 build.

## Deployment note
Deploy the included `firestore.rules` as well as the website files. Without the updated rules, Actual users cannot create the automatic count session.
