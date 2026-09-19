# StockSync Pro v18.2.1 — User & Rights Edit Hotfix

## Fixed
- User & Rights > Edit no longer appears unresponsive.
- Edit User now opens in a centered modal rather than below the users table.
- Unrelated inventory/Tally realtime snapshots no longer re-render the Users page and destroy an open editor.
- Added Escape, backdrop click, X and Cancel closing behavior.
- Save Changes now shows an inline saving/error state and prevents duplicate clicks.
- User edit audit now stores both old and new role/display-name values.
- Service-worker cache key bumped so the updated UI is picked up after deployment.

## Deployment
Deploy all files from this build. `firestore.rules` are unchanged from v18.2, but should remain deployed from the v18.2 package.
