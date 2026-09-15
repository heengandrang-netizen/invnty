# StockSync Pro v10.5 Deep QA

Fixed in this pass:
- Login PIN validation is now consistently 6–12 digits.
- Missing Actual/Tally stock no longer appears as a false shortage/excess/variance.
- Tally role no longer opens the forbidden Count Sessions listener.
- Tally role now receives its import history correctly.
- Duplicate Tally-file detection checks Firestore by SHA-256 hash, not only the last 100 locally loaded imports.
- IN/OUT validates item and finite positive quantity.
- Custom reports require both dates.
- Deleted app users cannot accidentally be re-enabled from the UI.
- User list clearly shows immutable login ID separately from editable display name.
- Master desktop shell and Warm Ivory theme retained.

Known architecture limitation:
Strict blind dual-count privacy cannot be fully enforced with the current frontend-only countEntries design because second-user matching needs access to another counter's entry. A trusted Cloud Function/backend is the correct production fix.

Static/regression QA is not a substitute for deployed Firebase E2E testing.
