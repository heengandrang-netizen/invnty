# StockSync Pro v18.4 — Tally Easy Import

## Why this change
The previous safe-import logic blocked the entire Tally file when even one valid row did not already exist in Item Master. For a Tally-role staff member this was confusing because the preview showed a new item but the role could not create it.

## New behavior
- Existing Item Master names/aliases are matched normally.
- Minor spelling variations can be smart auto-matched only when size/number tokens are compatible.
- Valid unmatched rows with a quantity are automatically created as new Item Master records.
- New records created by a Tally-role user are marked `pendingReview` and shown to Master as **Imported · review**. Review is advisory and does not block the stock import.
- Rows with no quantity are ignored automatically.
- Exact duplicate rows carrying the same quantity are de-duplicated automatically.
- Only conflicting duplicates, ambiguous aliases, invalid/negative quantities, or multiple rows targeting one existing SKU pause the import.
- Those rows appear in one compact **Fix Issues** panel with: quantity override, map-to-existing selector, and explicit Skip row.

## Security
Tally users still cannot freely create/edit/delete Item Master records. `firestore.rules` permits Tally-role item creation only when the record:
- belongs to a Tally import created by that same signed-in user,
- references an import whose status is currently `processing`,
- uses the restricted `tally_import_auto` source,
- has a fixed allowed field set, active=true, sensitive=false and pendingReview=true.
Updates/deletes remain Master-only.

## Deployment
Deploy both the website files and the included `firestore.rules`. The v18.4 service-worker cache name is new, so a hard refresh / PWA reopen is recommended after deployment.
