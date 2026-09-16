# v18 — SKU Mapping Master, UOM conversion check, Item Merge, Command Search

The four features explicitly called out as deserving their own dedicated round. Built and verified
one at a time rather than as a single sprawling change, since each touches core matching/data
logic where a mistake would be expensive.

## SKU Mapping (in the Tally preview, not a separate screen)

Rather than a standalone "mapping master" table disconnected from the workflow, mapping happens
right where the ambiguity shows up: every "New item" row in the Tally preview now has a dropdown —
**"— Create as new item —"** or any existing item. Pick one, and:
- The row immediately reclassifies as an update to that item (summary counts refresh live).
- A **"Remember this mapping"** checkbox (checked by default) appears — if left checked, the raw
  Excel name is saved as a permanent alias on the target item when you import, so the *next* file
  with that same raw name auto-matches without needing this step again.

This directly reuses the alias system that was already the app's matching mechanism — it just
removes the friction of "cancel, go add the alias in Item Master, come back, re-upload."

*Verified*: mapped a "new item" row to an existing item, confirmed the live count updated, imported,
and confirmed the raw name landed correctly in the target's alias list.

## UOM Conversion check

Item Master's per-item `unit`/`packUnit`/`packSize` is already meant to be authoritative — a new
Tally file was already never allowed to silently overwrite an existing item's conversion (that was
already true before this release). What was missing: no one told you when a file's numbers
*disagreed* with what Item Master already has on file. The preview now flags it — "⚠ File implies
1 Case = 24 Piece, Item Master says 20" — right in the Check column, for any matched row where the
file-implied ratio is more than 5% off from what's stored. It's a warning, not a block (a real
change in packaging is a legitimate reason for the numbers to differ) — but now it's visible
instead of silent.

*Verified*: seeded an item with a deliberately-wrong stored packSize, ran the real sample import,
confirmed the mismatch chip and per-row warning appeared with the specific numbers.

## Item Merge Tool

Item Master's Merge button opens an inline picker — choose which existing item to merge into —
and:
- Adds the source item's name and all its aliases onto the target (so future imports/searches for
  the old name land on the target automatically).
- Marks the source `active:false` with a `mergedInto` pointer, rather than deleting it. Its
  historical counts, movements, and audit records are untouched — they're immutable by design
  (v14/v16.2), so there was never a safe way to reassign them to the target's ID anyway. A
  "Show merged/inactive" toggle in Item Master lets you see what's been merged and into what.
- Deliberately does **not** copy stock figures across — the tool says so in the confirmation text.
  Picking whose number is "right" is a judgment call the tool shouldn't make silently; the next
  Tally import or physical count naturally refreshes the target's numbers instead.

**Prerequisite that had to be built first**: merged/inactive items needed to actually disappear
from the places they'd cause confusion — the Movement item picker, the Actual Count workspace, and
Tally's own matching pool all now filter to active items only. Previously there was no active/
inactive concept enforced anywhere outside the flag existing on paper.

*Verified*: merged one seeded item into another, confirmed the source flipped to inactive with the
right pointer, the target gained the alias, the merged item vanished from the Movement dropdown,
and reappeared correctly under "Show merged/inactive" with a "Merged into X" label.

## Command Search

A search box in Master's topbar (not shown for Actual/Tally — they only have one or two tabs each,
where this wouldn't add much). Type an item name, a count session name, or a Tally import's
filename, and a dropdown shows matches across all three, each one click away from the right tab —
clicking an item result jumps to Item Master with that item already searched for.

Scoped to items, sessions, and imports for this release — all three are already loaded client-side
for other reasons, so this added no new network calls. Users aren't included yet, since the user
list isn't currently kept as a live in-memory array the way these three are; adding that is a small
follow-up, not a blocker to shipping the rest.

*Verified*: typed a partial item name, confirmed the dropdown matched it, clicked it, confirmed
navigation to Item Master with the search box pre-filled.

## Also fixed along the way

- Item Master's Dashboard/Reports table (`table()`), Dashboard KPI counts, and the Tally-matching
  candidate pool now all exclude inactive items consistently — needed for the merge tool to
  actually hide what it merges away, and a genuine gap on its own (previously "active" was a field
  that existed but nothing ever checked it).
- The Tally similarity-suggestion ("New item — maybe X?") now only shows when the match is
  reasonably confident (≥50% similarity score), instead of always surfacing whatever the closest
  item happened to be, however unrelated.

## Deploy note

No `firestore.rules` changes in this release — everything here works within the existing rules
(`items` writes are already `master()`-only with no field restrictions, which already covers both
the merge operation and alias updates from SKU mapping). Deploy `index.html` on its own is fine
this time.
