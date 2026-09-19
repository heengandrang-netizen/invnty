# StockSync Pro v18.4 — Tally Easy Import

This release simplifies Tally upload so ordinary data differences do not stop a complete Excel import.

### Automatic handling
- Existing items match normally.
- Minor safe spelling differences can auto-match.
- Valid unmatched rows are auto-created.
- No-quantity rows are ignored.
- Exact same-value duplicates are de-duplicated.

### Fix Issues only when necessary
A blocking panel now appears only for genuinely risky rows. Staff can correct quantity, map the row to an existing item, or explicitly skip the row. The main preview remains read-only and clear about what will update, what will be newly created, and what will be ignored.

### Restricted Tally auto-create
Tally-role item creation is allowed only as part of that user's active `processing` Tally import and only with a strict allow-listed record shape. The new item is marked `pendingReview=true`. Tally users still cannot edit or delete Item Master records outside that import. Master can review/rename/merge the item later without stopping the stock import.

### Deployment
Upload the v18.4 web files **and deploy the included `firestore.rules`**. Then hard refresh / reopen the installed PWA once so the v18.4 service worker replaces the old cache.
