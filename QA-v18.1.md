# StockSync Pro v18.1 — Deep QA Summary

## High / Critical fixes
1. Tally rollback was restoring the imported value instead of the quantity that existed before the import.
2. An old rollback could overwrite stock from a newer Tally import; rollback now restores only rows still owned by that import.
3. Tally-role manual mapping could try to save an alias to Item Master and fail with permissions; non-Master mapping is now import-only.
4. Duplicate, ambiguous, invalid, or matched-without-quantity Tally rows could be silently skipped; import is now blocked until those rows are corrected.
5. Large Tally batches could exceed Firestore Security Rules document-access limits; write groups are now rule-aware and smaller.
6. Same-batch new SKU + stock creation could fail because the stock rule checked the pre-write item state; it now uses `existsAfter()`.
7. Rollback snapshots were not tied strongly enough to the import creator; Firestore rules now validate ownership and snapshot shape.
8. Re-running the exact file after a partial failed import could establish the wrong future rollback baseline; re-run is blocked when saved rows still need restoration.
9. Failed Auth-user cleanup used an invalid namespaced-style deletion call; modular `deleteUser()` is now used.

## Medium fixes
10. Missing stock could be counted as low stock because `undefined` became zero.
11. Reports converted missing Tally/Actual values into zero and included inactive/merged SKUs.
12. Repeated-variance streaks could inflate from corrections within the same count session and started from zero.
13. Pack conversion could save inconsistent data for invalid/negative programmatic values; Item Master validation is stricter and aliases are de-duplicated.
14. Unknown/malformed user roles could authenticate into an unusable shell; role validation now fails closed.
15. Legacy movement values are escaped/numeric-normalized before display.

## Automation / simplification / premium UX
16. Tally header, item, primary quantity and alternate quantity columns are auto-suggested, with manual override.
17. Dashboard now calculates an **Automated Next Step** from failed imports, open variances, count-session state, uncounted items and low stock.
18. Physical-count search now matches aliases as well as item names.
19. Login supports Enter, count-session naming defaults to the current date, and network state is clearer.
20. Firestore uses persistent IndexedDB multi-tab cache with memory fallback; the service worker opportunistically pre-caches core external libraries and runtime-caches static dependencies.
21. Tally preview can be prepared offline, but Tally commit and restore require internet so stock-changing imports are not queued/raced blindly.
22. Visual system upgraded to a warm ivory / sage / gold premium hierarchy with glass top bar, richer navigation, better table/card density and responsive layout.

## Validation performed
- Main ES-module JavaScript: `node --check` passed.
- Service worker JavaScript: `node --check` passed.
- Pure tests passed for Tally quantity parsing and single-/dual-quantity column auto-detection.
- Static assertions passed for rollback baseline, partial-failure guard, modular Auth cleanup, role validation, `existsAfter()` and snapshot ownership rules.
- HTML parser/static structure check passed.

## Environment limitation
A real Firebase project/emulator was not available in this sandbox, and outbound CDN/DNS loading was unavailable for a full authenticated browser E2E run. Therefore live Firebase Auth/Firestore permission behavior should still receive a short smoke test after deployment. The rule changes are based on the app's actual write shapes and Firebase's documented batched-write / `existsAfter()` behavior.

## Architectural items intentionally not presented as solved
- Fully private blind counting needs a trusted backend/Cloud Function if an `actual` user must be technically unable to read another counter's raw entries.
- Secure reset of another user's PIN/password needs Firebase Admin SDK / Cloud Function.
- True historical “as-of-date” inventory reconciliation needs dated inventory snapshots; the current downloadable report uses range movements plus current closing Tally/Actual values.
- Two different Tally files started at almost the same instant can still create a concurrency race. A server-side import lease/lock is the next reliability upgrade if simultaneous importers are common.
