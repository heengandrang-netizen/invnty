# StockSync Pro v18.4 — Tally Easy Import QA

## Reported problem reproduced from UI
A Tally-role user could preview a file where most rows matched but a few rows were valid new products. The preview labelled them as new, but the import button remained disabled because Tally users were not permitted to create those products. The screen also did not provide a simple, focused resolution workflow for the genuinely blocking rows.

## Changes verified
1. Valid unmatched rows with a numeric non-negative quantity are **non-blocking** and are automatically created during the same Tally import.
2. Auto-created records from a Tally-role user are restricted to `source=tally_import_auto`, tied to that user's currently-processing import, `active=true`, `sensitive=false`, and `pendingReview=true`.
3. Tally-role users still cannot freely edit/delete Item Master records. Master remains the only role allowed to update/delete them.
4. Master sees auto-created records with **Imported · review** in Item Master; saving an edit clears the review flag.
5. Rows with no quantity are ignored and do not block the whole file.
6. Exact duplicate rows with the same normalized item name and same quantity are automatically de-duplicated.
7. Conflicting duplicate quantities, ambiguous aliases, invalid/negative quantities, and multiple rows targeting the same existing item remain blocking for safety.
8. Blocking rows appear in a compact **Fix Issues** panel with quantity override, existing-item mapping where relevant, and explicit Skip row.
9. Minor spelling variations can smart-auto-match only when numeric/size tokens are compatible. Numeric variants such as `10g` and `20g` are not auto-matched merely because the rest of the name is similar.
10. Import history records skipped-row count when present.
11. Service-worker cache was bumped to `stocksync-v18-4-tally-easy-import`.

## Automated checks
- Main module JavaScript syntax: PASS
- Service-worker JavaScript syntax: PASS
- Tally smart-candidate numeric-safety regression: PASS
- 22/22 v18.4 static behavior/security assertions: PASS
- CSS parser: PASS (0 parser errors)
- HTML parser smoke check: PASS
- `manifest.json`: PASS
- `firebase.json`: PASS

## Important deployment requirement
Deploy the included `firestore.rules` together with the web files. Without the v18.4 rules, a Tally-role user will not be allowed to auto-create a valid unmatched Item Master record and those imports can fail with permission denied.

## Live Firebase limitation
The sandbox does not have the user's production Firebase project credentials/emulator, so authenticated production Firestore end-to-end writes were not executed here. The client write shapes and rule conditions were checked together and the JavaScript/static regression suite passed.
