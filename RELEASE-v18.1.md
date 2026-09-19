# StockSync Pro v18.1 — Premium Automation & Integrity Release

This build keeps the v18 workflow but focuses on three goals: safer stock data, fewer manual decisions, and a cleaner premium interface.

## What changed
- Correct pre-import Tally rollback snapshots with newer-import overwrite protection.
- Safer failed-import recovery: the same file cannot be re-run over saved partial rows until those rows are restored.
- Firestore rules hardened for new-SKU batched imports and rollback-snapshot ownership.
- Rules-aware smaller write groups for large Tally files.
- Risky Tally rows block import instead of being silently skipped.
- Master-only permanent alias writes; Tally users can still map a row for the current import.
- Automatic Tally column/header suggestions.
- Correct low-stock, report missing-value and repeated-variance calculations.
- Persistent Firestore cache and improved service-worker dependency caching.
- Premium warm-ivory / sage / gold visual refresh.
- Automated Next Step dashboard guidance.
- Alias-aware counting search and small workflow simplifications.

## Deployment note — important
Deploy the web files **and** the updated `firestore.rules`. The import/rollback fixes depend on both sides. If only `index.html` is uploaded while old Firestore rules remain live, new-SKU imports and rollback hardening will not be fully applied.

After deployment, do one smoke test with each role (Master, Actual, Tally): login, one normal count save, one small Tally preview/import, one report download, and—using test data—one v18.1 import restore.
