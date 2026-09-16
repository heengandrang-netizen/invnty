# v16 — Activity Log, movement reversals, and the "who did what when" ask

This release covers two things asked together: implementing the four movement-ledger suggestions
from the last round, and a proper answer to *"jab agli baar karega tab tak koi na koi inventory
move ho chuki hogi"* — the fact that Tally imports, manual IN/OUT, and physical counting all
happen at different, independent moments means a variance can look real when it's actually just
timing. The fix for that isn't a calculation — it's being able to see the timeline.

## New: Activity Log (master-only tab)

A single, searchable, chronological feed combining every Tally import, every manual IN/OUT, and
every physical count entry — each with exact date/time and who did it. Search by item name to
pull up that one item's full story: when it was last Tally-imported, every stock movement since,
and every physical count against it. If a movement happened between the Tally snapshot and the
physical count, that's visible right there instead of being invisible context behind a number.

This uses data the app was **already collecting and already discarding from view**:
`actualHistory` (every physical count, ever) has existed since early versions but was write-only —
nothing ever displayed it. It's wired into a listener and shown for the first time here.

*Verified:* seeded movement + count events, confirmed they appear with correct timestamps, item
names, and searched correctly by item.

## Movement ledger improvements

- **Who column.** Every new movement now stores `createdByName` alongside `createdBy`, and the
  ledger shows it. (Older entries created before this update won't have a name — they'll show
  "—" since there's no reliable way to back-fill who did something that wasn't recorded.)
- **"Today only" filter.** A checkbox next to the search box scopes the ledger to just today's
  entries — matches the "daily data" framing directly instead of scrolling the whole history.
- **Large-quantity warning.** Before saving, an OUT larger than the item's currently known stock,
  or any quantity more than 3x current stock, triggers a confirm dialog ("this looks unusually
  large — continue?") instead of saving silently. Catches an extra zero before it becomes a
  permanent, immutable ledger entry.
- **Reverse Entry.** Movements still can't be edited or deleted — that's intentional, for audit
  integrity — but each row now has a **Reverse** button that creates a new, opposite-direction
  entry (OUT→IN or IN→OUT, same quantity) with a required reason, linked back to the original via
  `reversalOf`. The original row then shows "Reversed" instead of the button, so it's obvious at a
  glance that a correction exists rather than someone just quietly re-entering the opposite thing
  with no trace.

*Verified:* reversing a real entry created a correctly-typed linked movement and flipped the
original row's UI from "Reverse" to "Reversed"; a 500-unit OUT against 100 units of known stock
correctly triggered the warning dialog.

## Reports no longer depend on a capped live list

The live `movements` listener is now capped at the most recent 300 entries (`limit(300)`) — with
two roles now able to log movements daily, the uncapped version would only get more expensive over
time, exactly the concern raised last round. The risk with just adding a cap is that Reports used
to filter *that same array* by date range, so an old report could go silently wrong once the array
got truncated.

**Fix:** `reportRows()` now runs its own dedicated Firestore query scoped to the exact selected
date range, independent of the capped live list. Reports stay correct no matter how large the full
movement history grows.

*Verified* by directly inspecting the downloaded Excel files' actual content: a movement from 10
days ago was correctly **excluded** from the default Weekly report (IN showed 0) and correctly
**included** once a 30-day Custom range was selected (IN showed the real 50) — the exact behavior
being tested, confirmed in the real exported spreadsheet, not just "no error was thrown."

## Firestore rules

`actualHistory` now has the same field validation the other collections got in v14 (`createdBy`
must match the signed-in user, `newQty` must be a real non-negative number, the item must exist) —
it had none before, which mattered less while the collection was invisible, but matters now that
Activity Log surfaces it as an audit record people will actually look at and trust.

**Same deploy note as before:** deploy `firestore.rules` before this `index.html`, and ideally
sanity-check the updated rules in Firebase Console's Rules Playground first.
