# StockSync Pro v18.2 — Deep Fix Release

## Release goal
A safer, simpler and more automated inventory workflow on top of v18.1, with special focus on Tally import integrity, multi-user physical counts, recovery, permissions and production error handling.

## Operational changes
- One active physical-count session at a time.
- Current-session progress drives dashboard Counted / Not Yet Counted.
- Sensitive count conflicts become an automated next action.
- Tally preview blocks unsafe rows automatically.
- Tally columns auto-detect and can still be overridden.
- Interrupted/partial imports have a guarded recovery path.
- Lists are more predictable and error feedback is explicit.

## Data-safety changes
- Duplicate mapped target SKUs are blocked before Tally commit.
- Tally-only user cannot silently ignore unmatched rows.
- Import snapshots/stock writes are bound more tightly by Firestore rules.
- Restore is Master-only and remains newer-stock-aware.
- Item conversion/user administration audit writes are atomic.
- Smaller import batches reduce rules-limit failure risk.

## PWA changes
- Cache: `stocksync-v18-2-deep-regression`
- Navigation cache accepts successful responses only.
- App icons are included in core cache.
- Critical Tally writes require network connectivity.

## Deploy
1. Replace the hosted files with this build.
2. Deploy the included `firestore.rules`.
3. Open once online so external libraries/service-worker cache refresh.
4. Smoke-test with Master, Actual and Tally roles.
5. Test one Tally preview/import and one physical-count session before production use.
