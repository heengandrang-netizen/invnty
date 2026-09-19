# StockSync Pro v18.4.1 — Zero-Stock Tally Import

## What changed

- Tally quantity `0` is treated as a real stock value, never as missing data.
- Accepted zero forms now include numeric `0`, `0.00`, strings such as `0 Pc` / `0.000 Kg`, `NIL`, and dash values.
- A new **Zero-stock mode** is enabled by default. When both selected quantity cells are blank, an already-matched Item Master item is imported as Tally quantity `0`.
- Blank rows that do **not** match an existing item remain ignored. This prevents group headings or non-stock rows from being auto-created as zero-stock products.
- Import preview clearly labels rows that will save Tally zero, including those inferred from a blank closing-balance cell.
- Dashboard now has a **Tally 0 / Stock Found** KPI/filter.
- When Tally is `0` but Actual is positive, status is shown explicitly as **Tally 0 · stock found**, and the automated next step routes the Master to variance investigation.
- The reverse mismatch (Actual `0`, Tally positive) is also labelled clearly.

## Security / rules

No new Firestore permission is required beyond v18.4. Existing rules already accept non-negative stock quantities (`qty >= 0`) and zero-valued rollback snapshots.

## Important behavior

If the Tally export completely omits a zero-stock item (there is no item row at all), the importer cannot infer that absent row as zero. Configure the Tally export to include zero/blank closing-balance item rows if you want those items refreshed to zero.
