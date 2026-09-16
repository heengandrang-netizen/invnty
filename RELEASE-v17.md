# v17 — count-save atomicity, first-Master race, reorder levels & dashboard drill-down

A fifth audit pass plus a long feature wishlist arrived together. Verified every bug claim against
the real code before touching anything (a couple were already covered by earlier fixes, most were
new and real). For the feature list — 20+ items, several of them (offline queue, conflict
resolution, as-of-date snapshots, item merge, SKU mapping master, daily closing) genuinely
substantial features on their own — implemented the small number that fit cleanly into the
existing app without new infrastructure, and left the rest as a clearly-scoped list rather than
attempting a shallow pass at all of them in one sitting.

## Fixed

**Count save is now atomic.** `saveCount()` made four separate sequential writes (count entry →
actual stock → audit history → recount completion). A failure partway through could leave a
half-saved state — the count entry recorded but the official stock figure never updated. All four
are now one atomic batch: everything commits together or nothing does. *Verified*: saved a count
and confirmed all three resulting records (entry, actual stock, history) land together correctly.

**"Previously 0" no longer hides "never counted."** The audit history's `oldQty` used to default to
`0` whether an item had actually been counted at 0 before, or had never been counted at all. It's
now `null` for "never counted," so the Activity Log can (eventually) tell the two apart instead of
showing a misleading "previously 0."

**First-Master setup had the same race condition already fixed for regular user creation.**
Creating the very first Master used the app's own primary auth instance — so the app's own
login-state listener could fire the instant the account was created, see no Firestore profile yet
(the write hadn't finished), and sign the brand-new account back out with a confusing error, even
though setup was about to succeed. Now uses an isolated secondary Firebase app instance for the
account + profile write (same pattern the regular Create User flow already used), and only signs
in on the real app once the profile is confirmed written. Also now cleans up the Auth account if
anything fails after it's created, instead of leaving it orphaned.

**Report download buttons could get stuck disabled forever.** No `try/finally` around the export
logic meant a query error left the button showing "Preparing…" with no way to retry short of
leaving and returning to the tab. *Verified*: forced an error mid-export, confirmed the button
re-enables.

**Two more Firestore rules tightened**, following the same pattern as v14/v16.2: `actualLatest`
writes must now reference a `countSessions` document that's genuinely open right now (matching
what `countEntries` already required); `stockLatest` writes must now reference a real, existing
Tally import (via `importId` for a fresh import or `restoredFromImportId` for a rollback). Neither
makes the write fully workflow-proof on its own — a determined technical user could still fabricate
a minimal session or import record to satisfy the check, which is why the audit correctly notes
this needs a Cloud Function for a complete fix — but both now require leaving a real, traceable
link to a workflow record instead of a fully free-form write.

## New: two features that fit directly into what already exists

**Reorder Level + Low Stock.** Item Master has a new optional "Reorder level" field. When set, the
Dashboard's new **Low Stock** KPI counts items at or below their threshold (using whichever is more
current — physical count if available, otherwise Tally stock), and the item list flags it.

**Dashboard drill-down.** Every KPI card (Shortage, Excess, Repeated Variance, Low Stock, Not Yet
Counted, etc.) is now a button — click it and the table below filters to exactly that set of items,
with a "Clear filter ✕" chip to get back. Combines with the existing search box.

**Import Preview Diff.** The Tally upload preview now has a "Current → New" column for rows that
match an existing item, showing the before/after and the percentage change right in the preview
table — not just the raw new number — matching what was asked for in the feature list. (The
existing "Large change" flag already covers anomaly-style detection for unusually big jumps.)

*Verified* all three together: set a reorder level on a real item, confirmed the Low Stock KPI
counted it, clicked it to drill down and confirmed the table filtered correctly, cleared the
filter and confirmed the full list came back; ran the Tally preview and visually confirmed the
diff column renders correctly for a matched row.

## The rest of the feature list — not built this round, and why

Grouped by what they'd actually require:

**Needs a bigger data model (multi-day design work, not a patch):**
Stock Ageing / Dead-Slow-Fast Moving Analysis, No-Movement Alerts, As-of-Date Stock View, Daily
Closing / Stock Lock, Cut-off Date Control, Stock Timeline per item, Item Change History. All of
these want to reconstruct "what did things look like at a past point in time," which this app's
current model (always-current `stockLatest`/`actualLatest`, unbounded event logs) doesn't cleanly
support yet — it needs either periodic snapshotting or an event-sourced rebuild, a real design
decision, not a quick addition.

**Needs backend infrastructure (Cloud Functions / a real backend), not just client code:**
Offline Counting Queue with conflict detection, Conflict Resolution Center, the AI-style anomaly
assistant. These need either a proper local-first sync engine or server-side logic that can't live
safely in browser JavaScript.

**Substantial standalone features, each deserving its own focused pass:**
SKU Mapping Master, UOM Conversion Master (as a first-class shared table rather than inferred
per-import), Item Merge Tool, full Import Control Center lifecycle (Pending → Validated →
Imported → Reconciled → Closed — right now it's effectively Processing → Completed/Failed),
Command Search across items/users/sessions/imports in one box.

None of these are being waved away — they're genuinely good ideas, several of them (SKU Mapping
Master and UOM Conversion Master especially) would meaningfully improve the Tally import accuracy
this app already leans on. They just don't fit as a same-session addition next to five rounds of
bug fixes without risking the kind of rushed, under-tested work this whole review process has been
specifically trying to avoid. Worth picking 2-3 as the next dedicated round.

## Deploy note

Same as every round since v14 — `firestore.rules` first, then `index.html`.
