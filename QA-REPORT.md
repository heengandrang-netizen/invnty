# StockSync Pro v2 QA Report

Static regression checks passed: firebase_config_import, role_tabs, blind_count_text, snapshot_collection, variance_collection, count_session_rules, deny_default, no_barcode, no_godown.

## Bugs fixed / hardened
- Service worker cache version bumped and old caches deleted on activation, reducing stale-build problems.
- Exact duplicate Tally file imports are blocked using SHA-256 file hash.
- Negative, invalid and duplicate Excel rows are excluded from commit.
- Large Tally quantity changes are flagged in preview.
- Physical count remains blind: actual-role UI does not render Tally quantity and Firestore rules deny that collection.
- Tally role cannot read physical-stock collections.
- Count entries, Tally snapshots, approvals and histories are append-only under rules.
- Locked count sessions cannot be reopened by count users.
- Sensitive items require a second user's matching count before latest physical stock is accepted.
- Variance resolution is master-only and creates an approval log.

## Remaining production dependency
Secure creation of Firebase Authentication users and PIN reset from inside the Master UI requires a Firebase Admin backend / callable Cloud Function. It is intentionally not faked client-side.
