# StockSync Pro v18.2 — Deep Regression QA

Date: 2026-09-19
Base build: v18.1 fixed
Scope: second-pass code/data-integrity/security/offline/workflow/UI regression audit.

## High-risk defects fixed

1. **Tally-role silent omission of unmatched rows**
   - Tally-only users can no longer complete an import while unmatched source rows are silently skipped.
   - Every unmatched row must be mapped before import; only Master can create new Item Master records.

2. **Multiple Excel rows mapping to one SKU**
   - Import preview detects two or more source rows resolving to the same target SKU.
   - Import is blocked until the source/mapping is corrected, preventing last-write-wins stock corruption.

3. **Interrupted/partial Tally re-import safety**
   - Stale `processing` and failed imports are checked for saved rollback snapshots.
   - The same file cannot be re-run over partially committed stock until a Master restores the saved rows.
   - Later successful retry marks the old issue as recovered for dashboard purposes.

4. **First Master bootstrap recovery**
   - Once bootstrap/profile writes are committed, a later temporary-auth cleanup/login failure no longer attempts to delete the Auth user and leave the app bootstrapped to a missing account.

5. **User provisioning consistency**
   - User profile and audit event are committed atomically.
   - Edit/enable/disable/archive operations use batched audit + profile writes.

6. **Physical-count multi-user duplication**
   - Normal SKU progress is team/session based instead of user-only.
   - A fresh `actualLatest` check rejects a duplicate normal count already completed by another user in the same session.

7. **Sensitive dual-count conflict visibility**
   - Conflicting second count is not treated as completed.
   - Dashboard prioritizes dual-count conflict resolution.
   - Sensitive first/second counts use a fresh query where available before publish.

8. **Count-session simplification**
   - One open count session at a time.
   - Reopen is blocked while another session is open.
   - Lock warns about unverified active items.
   - Dashboard Counted/Not Counted is scoped to the current open session.

9. **Lifetime-wide count-entry subscription**
   - Removed the unbounded subscription to all historical `countEntries`.
   - Only open-session count entries are live-subscribed, reducing Firestore reads and long-term memory growth.

10. **Floating-point false variances**
    - Quantity math is normalized through rounded stock precision before comparison/streak logic.

11. **Stale variance workflow state**
    - A newer physical count resets the displayed old investigation/resolution workflow instead of carrying a stale Resolved reason forward.
    - Resolution audit + variance state are committed atomically.

12. **Stale low-stock source selection**
    - Known quantity now prefers the newer of Actual/Tally records rather than blindly preferring an old physical count.

13. **Item conversion audit consistency**
    - Item Master conversion edit and conversion-history event are now one atomic batch.

14. **Security-rule hardening for Tally writes**
    - Import stock writes must reference the current user's active `processing` import.
    - Tally snapshots are tied to the same creator and active import.
    - Restore path is Master-only.
    - New SKU + stock batched validation keeps `existsAfter()` behavior.

15. **Rules-aware import batch size**
    - Tally write grouping is reduced to small batches to lower Firestore security-rule document-access pressure during large imports.

16. **Refresh/UI staleness**
    - Realtime updates received while editing are deferred and rendered on focus-out rather than being silently lost.
    - Command-palette document click handler no longer accumulates across logins.

17. **PWA/offline safety**
    - Service-worker cache version bumped.
    - Failed navigation responses are not stored as the offline shell.
    - Icons and external runtime libraries are cached opportunistically.
    - Tally stock commit/restore stays online-only; file preview can remain offline after libraries are cached.

18. **Failure-feedback hardening**
    - Item save/merge, count save, session start/lock/reopen, recount, user loading and Tally file parsing now show actionable errors instead of leaving silent rejected promises.
    - Corrupt/password-protected spreadsheets fail gracefully.

## Automated validation performed

- Main ES module syntax: PASS (`node --check`)
- Service worker syntax: PASS
- Static regression assertions: **38/38 PASS**
- Quantity/import logic tests: PASS
  - decimal rounding
  - variance rounding
  - login-name normalization
  - punctuation/accent normalization
  - comma/accounting quantity parsing
  - Tally column detection
  - duplicate mapped-target detection
- CSS parser: 0 stylesheet errors / 0 declaration errors
- `manifest.json` / `firebase.json`: valid JSON
- SVG icons: valid XML

## Environment limitations / remaining architecture work

These are not being represented as solved by client-side code:

- **True secure blind dual counting:** Actual-role clients currently require operational Firestore reads. Field-level secrecy between counters needs a trusted backend/Cloud Function (Firestore rules cannot redact individual fields in a readable document).
- **Repeated-variance streak for Actual-role counts:** the Actual role intentionally cannot read Tally stock. Therefore it cannot safely calculate historical Tally-vs-Actual variance at count time in the browser. A trusted backend should calculate/store this after a physical count.
- **Simultaneous different Tally files:** the client blocks duplicate same-file imports, but a true organization-wide import lease/transaction should be server-side to prevent two different files being committed at exactly the same time.
- **Historical as-of-date closing stock:** current report explicitly uses current Tally/Actual closing figures with date-filtered IN/OUT. True historical closing needs periodic immutable inventory snapshots.
- **Live Firebase/Rules emulator E2E:** unavailable in this sandbox. Browser navigation/localhost is also blocked by the execution environment, so authenticated browser-level integration could not be run here. Static/rules inspection and pure logic regression tests were run instead.

## Deployment requirement

Deploy **both** the web build and the included updated `firestore.rules`. Deploying only `index.html` leaves security/import behavior out of sync with v18.2.
