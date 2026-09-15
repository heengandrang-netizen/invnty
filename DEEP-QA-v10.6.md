# StockSync Pro v10.6 — Deep Bug + UI/UX QA

Fixed in this pass:
- Firestore realtime listeners are now unsubscribed on logout/re-subscribe.
- Actual counts re-check that the count session is still OPEN before saving.
- Firestore rules also reject count entries into locked sessions.
- Recount completion rule can no longer overwrite unrelated request fields.
- Duplicate item names/aliases are blocked to prevent ambiguous Tally matching.
- Tally matcher detects ambiguous mappings rather than silently choosing the last item.
- Empty Excel sheets are handled cleanly.
- Custom report validates From <= To.
- Report labels now correctly say CURRENT Tally/Actual because only IN/OUT is historical for the selected period.
- Mobile/topbar/table/action spacing and focus states refined.
- Warm Ivory theme retained.

Known architecture item:
Strict blind dual-count privacy still requires a trusted backend/Cloud Function because Actual users currently need countEntries read access for client-side dual verification.

QA type:
Static/code/regression validation. Live Firebase E2E should still be tested after deploying the included updated Firestore rules.
