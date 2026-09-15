# v14 — Data-integrity fixes from the external audit

The user ran three deep-audit passes on the app (apparently through another AI tool) and shared
32 numbered findings. Each one was individually re-checked against the actual code before
anything was changed — a few were already fixed in earlier versions, a couple were design
tradeoffs rather than bugs, but most held up. This release implements the ones that were both
**verified true** and **safely fixable without a bigger architecture change**. Everything below
was tested against a real (mocked) Firestore in a browser, not just read through.

## Fixed and verified in this release

### 1. Tally import could get permanently stuck if it failed partway through
Large imports are split into 220-write batches. The import record used to be created in the
*first* batch — so if a later batch failed (network drop, etc.), the file's hash was already
marked as imported, and re-uploading the same file to finish the job was blocked with "This
exact file was already imported," even though most of it never saved.

**Fix:** the import record is now written on its own, first, with `status:"processing"`, then
flipped to `status:"completed"` only after every batch actually succeeds. A failure now sets
`status:"failed"` and shows a clear message, and the duplicate-file check only blocks re-upload
of imports that reached `"completed"`. Import History now shows a status chip on anything that
isn't completed, and the Restore button is hidden on failed imports (nothing to restore from).

*Verified:* injected a simulated failure partway through a real 971-row import — got a proper
error message, the record showed `status:"failed"`, and re-uploading the identical file was no
longer blocked. Then ran it again clean — the record showed `"completed"` and a second upload of
the same file was correctly blocked.

### 2. Background updates could wipe out whatever you were typing
Every Firestore listener called a full re-render of whatever screen was open. In a multi-user
setup, if you were mid-way through typing a new item's name (or any other form) and *anyone
else* saved a count, logged a movement, or imported stock, your screen would silently rebuild and
your typing would vanish.

**Fix:** a background update now skips the re-render if a form field inside the current screen is
focused, instead of always rebuilding. It picks up the fresh data next time you're not mid-input.

*Verified:* typed into the Item Master "name" field, fired a simulated background write from
another user, confirmed the text and cursor focus were untouched.

### 3. Saving the same item twice in a count session created duplicate records, and sensitive-item verification could compare against the wrong one
Every count save created a new `countEntries` document with a random ID, so re-saving a
correction for the same item just piled up extra records instead of replacing the first one — and
for dual-verification items, the code compared against `prior[prior.length-1]`, which isn't
reliable since Firestore doesn't guarantee that array's order.

**Fix:** each entry's ID is now deterministic (`session_item_user`), so re-saving updates your own
entry instead of duplicating it. The dual-count check now compares the new count against *every*
other counter's entry, not just an arbitrarily-picked "last" one.

*Verified:* saved the same item twice with different quantities — only one record existed both
times, with the latest value. For a sensitive item, seeded a second counter's entry and confirmed
a matching quantity saves silently while a mismatched one correctly triggers "Dual count mismatch."

### 4. Weekly/Monthly reports could silently miss the first day's movements
The report's start date was computed by subtracting days from "now," but never reset the
time-of-day. Pull a Weekly report at 6 PM and the range started at "6 days ago, 6 PM" — so
anything logged before 6 PM on that first day was excluded without any indication.

**Fix:** the start of the range is always reset to local midnight now, for Weekly, Monthly, and
the default range alike (Daily already did this correctly).

### 5. Report filenames could show the wrong date for users east of UTC
`toISOString()` is always UTC. For IST users, the file downloaded in the first ~5.5 hours of a
day could be named for the previous day.

**Fix:** filenames now use the browser's local date. *Verified* by setting a browser's clock to
1 AM IST (which is still "yesterday" in UTC) and confirming the exported filename used the
correct, current local date.

### 6. Near-duplicate item names could slip past the duplicate check
"ABC-100", "ABC 100", and "ABC/100" all normalized differently and weren't caught as the same
name — both when creating an item manually and when matching Tally import rows against existing
items.

**Fix:** a shared normalizer now collapses dashes, slashes, underscores, and repeated whitespace
before comparing, in both places. *Verified:* creating "ABC-100" then "ABC 100" now correctly
shows "Name/Alias conflicts."

### 7. Which "open" count session showed up first was not deterministic
No ordering was applied, so if more than one session was open, `actualView` picked whichever one
Firestore happened to return first — not necessarily the current/intended one.

**Fix:** open sessions are now sorted by creation time, most recent first, before picking one.

### 8. Firestore security rules were missing field validation on the collections that matter most
The rules allowed `master()`/`actual()`/`tally()` to write almost anything to `actualLatest`,
`stockLatest`, `movements`, `tallyImports`, and `tallySnapshots` — the UI was well-behaved, but
someone going around it (browser console, direct API calls) could write a negative quantity, an
unattributed record, or edit a past movement, and the rules wouldn't stop it. This is the same
class of gap the app already correctly closed for `countEntries` — these collections just hadn't
caught up.

**Fix:**
- `actualLatest` / `stockLatest` now require `qty >= 0`, a real number, `updatedBy` matching the
  signed-in user, and that the item actually exists.
- `movements` is now genuinely immutable — `update` is no longer allowed at all (previously
  `master()` could silently edit a past ledger entry with no UI trace of it), and `create` now
  validates `qty > 0`, `type` is `"IN"` or `"OUT"`, and the item exists.
- `tallyImports` / `tallySnapshots` now require `createdBy` to match the signed-in user.
  `tallyImports` also got a scoped `update` rule (previously fully blocked) so the
  processing→completed status flow above can work, restricted to the original creator changing
  only `status`/`matched`/`created`/`rowCount`/`error`/`completedAt`.
- `countEntries` got a matching `update` rule (previously fully blocked) so the deterministic-ID
  fix above can work — restricted to a user updating their *own* entry, for the same item and
  session, while the session is still open.

**⚠️ Important caveat:** I checked every write the app makes against these new rules field-by-field
to make sure nothing legitimate breaks, but I could not deploy-test this against a real Firestore
project or the local emulator (no network access to Google's emulator download in this
environment). **Before relying on this in production, please run it through Firebase Console's
Rules Playground, or deploy to a staging project first.** If anything in the app starts throwing
permission-denied errors after deploying these, that's the first place to look.

## Reviewed but deliberately not changed

A few findings were accurate observations about *how the app is designed*, not bugs — changing
them would be a product decision, not a fix, so I left them alone rather than silently altering
behavior:

- **Dashboard "Counted" isn't scoped to a single session.** It reflects the live, running
  `actualLatest` record regardless of which session last touched it. That's arguably correct for
  a continuously-tracked stock system — resetting it to zero at the start of every new session
  would lose visibility into stock between counting exercises. Worth a conversation if a
  session-scoped view is actually what's wanted.
- **Multiple open count sessions are allowed.** Could be locked to one at a time, but that's a
  workflow decision (e.g. different sessions per zone/department might be intentional).

## Not implemented — needs a real design decision or bigger scope

These were valid, useful findings, but each is either a genuinely new feature, a backend/infra
change (Cloud Functions), or a data-model change big enough that it deserves its own focused pass
rather than being bundled in here:

- **Fully private (server-side) blind counting.** Right now "blind" is enforced in the UI; the
  raw counts are still readable by anyone with the `actual` role via the network tab, as flagged.
  A real fix needs a Cloud Function to do the comparison server-side — that requires Firebase's
  Blaze (pay-as-you-go) plan and backend code, which is a bigger commitment than a client-side fix.
- **Historical "as-of-date" reporting** (opening + in/out = book closing, vs. physical closing,
  vs. variance, for a chosen past date) — reports currently always show *current* Tally/Actual/
  Variance regardless of the date range picked; only the IN/OUT columns are actually date-filtered.
  This is a real reporting feature to design, not a quick fix.
- **Reversal-based movement corrections**, **item archive/inactive lifecycle**, **PIN reset via
  Cloud Function**, **session snapshot/freeze so the SKU list is locked at session start**,
  **confidence-scored fuzzy matching**, **explicit duplicate-row resolution (sum/first/last)**,
  **skip-with-reason**, **structured dual-count-mismatch and session-reopen audit trails** — all
  reasonable, all deferred as separate feature work.
- **The central "Audit Session" redesign** proposed in the second audit pass (Tally Snapshot →
  Audit Session → assignments → blind counts → comparison → recount → variance → approval as one
  connected object) is the most valuable long-term idea in all three documents, but it's a genuine
  architecture change touching nearly every collection — not something to fold into a fixes patch.

## What to do next

Deploy `firestore.rules` first (with the Rules Playground check above) since the JS changes
assume the new `countEntries` update rule and `tallyImports` update rule are in place — without
them, re-saving a count correction or completing a Tally import will fail with permission-denied.
