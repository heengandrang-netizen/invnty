# v16.2 — critical Tally-import data bugs, plus a batch of race-condition hardening

A fourth audit pass found two genuinely severe, confirmed bugs in the v12 Tally import logic that
had survived every previous test because they only show up on specific data shapes (a blank
quantity next to a name that happens to match an existing item; a 0 in one of the two quantity
columns) — not the kind of thing that shows up by re-running the same sample file. Verified every
fix against the actual failure condition, not just "the code looks right now."

## 🔴 Confirmed and fixed — critical

**A matched item with a blank/invalid quantity could fail the entire import batch it was in.**
The code that decides "this row updates an existing item's stock" checked whether the quantity was
negative, but never checked whether it was missing entirely. A row that matched an existing item
name but had no usable number in the quantity column was still queued for a stock write with
`qty: null` — which Firestore's rules correctly reject (quantity must be a real number) — and
since batched writes are all-or-nothing, that one bad row would fail every other write bundled
into the same batch alongside it. *Verified*: built a file with a blank-quantity row matching a
real item, ran the import, confirmed that item's stock was correctly left untouched (not written
as null, not corrupted) and everything else in the batch still succeeded.

**A 0 in one of the two quantity columns silently discarded the other column's real number.**
When a Tally export has both a primary and an alternate quantity for a row, and one of them
happens to be exactly 0 (which the sample data showed does happen — a rounding artifact in the
smaller unit), the code was picking that 0 as the imported quantity and throwing away the other,
real value entirely. Example: Primary=0, Alternate=5 imported as **0** instead of 5. *Verified*:
built rows hitting all four combinations (0/real, real/0, 0/0, real/real) — each now imports
correctly, with 0/0 still correctly importing as a real zero when that's genuinely what both
columns say.

**A chunk boundary could split one item's create+stock+snapshot writes across two batches.**
Large imports are chunked at 220 writes per batch (Firestore's own limit). Previously, ops were
queued as one flat list and sliced by raw count — a new item's three related writes had no
guarantee of landing in the same batch. If batch 1 (ending mid-item) succeeded and batch 2 failed,
you'd get an item with no stock record, a data shape nothing else in the app expects. Ops are now
built as per-row groups and packed into batches without ever splitting a group — a row's writes
either all land in the same batch or none of them do. *Verified* against the real 971-row sample
file (creating ~2,900 individual writes across many batches): zero orphaned items — every created
item that should have a stock record has one.

## 🔴 Confirmed and fixed — race conditions

Same root pattern as the v16.1 fixes, in three more places that had the same gap:

- **Reversing a movement** now writes to a deterministic ID (`rev_<originalId>`) instead of a
  random one, so two people clicking Reverse on the same entry around the same time can't create
  two conflicting reversals — the second attempt fails cleanly with a clear message instead of
  silently duplicating. *Verified* by simulating two concurrent writes to the same original entry.
- **Requesting a recount** now uses a deterministic ID (`recount_<itemId>`) instead of a random
  one, closing the case where a double-click (or two people) created two "open" requests, and
  completing a count only closed one — leaving the other stuck pending forever. *Verified*: a
  scripted double-click now produces exactly one request document, not two.
- **Actual Count's Save / Save & Next buttons** had no double-click guard (Item Master and
  Movement got this in v16.1, these two were missed). A rapid double-tap could create two
  redundant `actualHistory` audit entries for one real save. Both buttons now disable for the
  duration of the write.

## Also fixed

- **Orphaned Auth accounts on user creation.** If the Firestore profile write failed *after* the
  Firebase Auth account was already created, the Auth account was never cleaned up — permanently
  squatting that username. It's now deleted on any failure after creation, freeing the name for a
  retry. (Same class of gap flagged in the very first review of this app; finally closed.)
- **Concurrent same-file imports.** The duplicate-file check now also blocks while another import
  of that exact file is actively `"processing"` (not just once one has completed), narrowing the
  window where two people starting the same file within moments of each other could both proceed.
  A stuck "processing" record older than 10 minutes is treated as abandoned rather than blocking
  forever.
- **Tally column selection** now rejects picking the same Excel column for Item Name, Primary
  Quantity, and Alternate Quantity — previously nothing stopped a nonsensical selection like that.
- **"Restore" button relabeled** to "Restore quantities" with clearer copy — it reverts the stock
  numbers an import changed, but does not remove any new items that import created, which the
  plain word "Restore" could read as promising.
- **Activity Log** now says plainly that it shows recent activity, not full lifetime history —
  so a search for something very old reads as "not shown here" rather than implying it never
  happened.

## Re-checked, no new issue found

**"Stored XSS" was raised as a concern.** Went through every place user-controlled text (names,
reasons, references, filenames, display names) reaches `innerHTML` across the whole file again,
specifically including everything added in v15/v16. Everything is correctly passed through `esc()`
before rendering — including a filename-escaping gap already caught and fixed earlier in this same
session. Found no additional unescaped instance. `alert()`/`confirm()` dialogs show raw text
regardless of escaping since those aren't an HTML context, so occurrences there were never at risk.

## Deliberately not addressed this round (and why)

- **Two Masters creating an identically-named item at the exact same moment**, or **two people
  starting the same Tally file within the same instant** (beyond the processing-status check
  above) — both need a real server-side lock (a Firestore transaction against a name/hash lookup
  collection) to close completely. The client-side checks already in place make either scenario
  rare in practice; a full fix is a small dedicated piece of work, not a quick patch.
- **Repeated Variance counting non-distinct audit cycles**, **fully reliable offline mode**,
  **"Synced ✓" reflecting real write status**, **fully private (server-side) blind counting** —
  all previously identified, all still accurate, all still need bigger design work (Cloud
  Functions, a session/audit-cycle data model, or a proper write-queue status system) rather than
  a patch. Not re-litigated here since nothing new was found about them this round.
