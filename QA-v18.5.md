# StockSync Pro v18.5 — QA

## Scope
Alternative UOM create/edit/remove and downstream compatibility.

## Verified
- Master can add multiple Alternative UOM conversions per product.
- Master can edit and remove Alternative UOM rows.
- Existing legacy `packUnit` / `packSize` is automatically exposed as one Alternative UOM.
- First Alternative UOM is mirrored back to legacy fields for compatibility.
- Alternative UOM name/factor validation rejects empty, duplicate, base-equal, zero and negative values.
- Alternative UOM requires a Base/Tally unit.
- Conversion history stores old/new Alternative UOM arrays atomically with the item update.
- Actual Count can choose among multiple Alternative UOMs.
- Alternative-only and Alternative + Base calculations normalize to base quantity.
- Actual count history stores the selected UOM and conversion factor used at the time of count.
- Smart Search indexes Alternative UOM names.
- Tally secondary-UOM validation selects the matching configured Alternative UOM when multiple conversions exist.
- Item Master edit form is protected from unrelated realtime rerenders while dirty.
- Service-worker cache bumped to v18.5.

## Automated checks
- JavaScript module syntax: PASS
- Service-worker syntax: PASS
- HTML parse: PASS
- manifest.json/firebase.json: PASS
- SVG assets: PASS
- v18.5 structural assertions: 18/18 PASS
- Alternative UOM compatibility/math tests: PASS

## Security
No new Firestore permission is required. Item Master create/update remains Master-controlled; Tally-role auto-create behavior remains restricted by the existing rules.
