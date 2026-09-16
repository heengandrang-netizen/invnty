# v15 — Tally role can now feed daily IN/OUT movements

Previously only Master had the IN/OUT (Movement) tab. Whoever handles the day-to-day Tally side
now gets it too, so daily stock movements can be logged without needing Master to do it personally
every time. Master keeps every tab exactly as before — this is additive, not a swap.

## What changed
- `tabs.tally` now includes `"movement"` alongside `"tally"`.
- Tally role now subscribes to the `movements` listener (previously master-only), so their ledger
  view is live and up to date, same as Master's.
- `firestore.rules`: `movements` read/create now allow `tally()` in addition to `master()`. Same
  validation as before either way — `qty > 0`, a real `IN`/`OUT` type, the item must exist, and
  `createdBy` must match whoever's actually signed in. Still fully immutable for both roles: no
  `update`, no `delete`, matching the v14 change.

## Verified
Signed in as the Tally role in a test run: sidebar correctly shows only "Tally Upload" and
"IN / OUT" (no Dashboard/Items/Users — those stay master-only), logged a real IN entry, confirmed
it wrote with the correct `createdBy`, and confirmed it appeared in the ledger table immediately.

## Deploy note
Same as v14 — `firestore.rules` needs to be deployed for this to actually work for a Tally-role
user; the UI will show the tab either way, but writes will fail with permission-denied until the
rule is live.
