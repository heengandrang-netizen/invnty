# StockSync Pro v18.4.1 — Zero-Stock QA

## Targeted tests

- `0` -> 0: PASS
- `0.00` -> 0: PASS
- `0 Pc` -> 0: PASS
- `0.000 Kg` -> 0: PASS
- `NIL` / dash -> 0: PASS
- Blank quantity + matched existing item + Zero-stock mode ON -> 0: PASS
- Blank quantity + unmatched text/group row -> ignored, not auto-created: PASS
- Positive quantities still parse normally: PASS
- Negative quantity remains invalid for Tally stock import: PASS
- Tally zero is included in update/create arrays (`baseQty != null`): PASS
- Firestore `stockLatest.qty >= 0`: PASS
- Firestore `tallySnapshots.importedQty >= 0`: PASS
- Tally-zero vs positive Actual produces a real variance: PASS
- Dashboard zero-mismatch status / filter / next action present: PASS
- Service-worker cache bumped: PASS

## Regression checks

- Main module JavaScript syntax: PASS
- Service worker JavaScript syntax: PASS
- manifest JSON parse: PASS
- Firestore rules still use non-negative quantity validation: PASS
- 19/19 zero-stock parser/decision tests: PASS
- 11/11 static zero-stock assertions: PASS

## Note

Zero-stock mode intentionally converts a blank closing-balance cell to zero only when the row already maps to an existing item. This avoids turning Tally group/header rows into new inventory items.
