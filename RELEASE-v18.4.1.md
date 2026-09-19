# StockSync Pro v18.4.1 — Zero-Stock Import

This hotfix makes zero a first-class Tally stock value so physical stock found against a Tally zero can be detected as a variance.

### New behavior
- Imports explicit 0 / 0.00 / quantity-with-unit zero values.
- Imports NIL and dash-style zero values.
- Default Zero-stock mode converts blank closing quantity to 0 for matched existing items.
- Leaves unmatched blank rows ignored for safety.
- Shows zero rows in preview before import.
- Adds `Tally 0 / Stock Found` dashboard KPI/filter and specific variance labels.
- Prioritizes Tally-zero/physical-positive mismatches in Automated Next Step.

### Deployment
Upload the v18.4.1 web files and hard refresh/reopen the PWA once. The service-worker cache key changed to `stocksync-v18-4-1-zero-stock`.

`firestore.rules` did not need a new zero-stock permission: v18.4 already allows quantity values greater than or equal to zero. Keep the included rules deployed, especially if upgrading from a version older than v18.4.
