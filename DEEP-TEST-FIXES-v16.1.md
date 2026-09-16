# v16.1 — bugs found during a deliberate deep-test pass

After v16, went back through the newest code specifically looking for problems rather than just
confirming the features worked — fresh code review plus adversarial testing (double-clicks, quick
role switches, edge-case data). Found and fixed four real bugs, all verified with a script that
reproduces the exact failure condition, not just "looks right."

## 1. Double-click on Item Master's Save could create two identical items
The duplicate-name check reads the local `items` array, which only updates a few milliseconds
*after* a write actually reaches Firestore (via the realtime listener). A fast double-click —
easy to do by accident, especially the double-tap that happens on some phones — fired the save
twice before the first write could get into that array, so the second click's duplicate check ran
against stale data and let a second, identically-named item through.

**Fix:** the Save button now disables itself for the duration of the write.

*Verified:* scripted an immediate double-click on a fresh item name — exactly one item exists
afterward, not two.

## 2. Double-click on Movement's Save could create two identical ledger entries
Same root cause, different screen. Saving a movement has no async pre-check to accidentally race
against, but there was nothing stopping the button itself from firing twice.

**Fix:** same pattern — button disables during the write, and now also clears the Qty/Reference
fields on success so the next entry starts clean instead of risking an accidental re-save of the
same values.

*Verified:* same double-click script — exactly one movement entry created.

## 3. False "unusually large" warning on the very first stock-in for a new item
The v16 large-quantity warning compared the new quantity against current known stock. For a
brand-new item with no stock recorded yet, "current stock" is 0 — and the threshold math
(`3× current stock`) against 0 meant *any* first purchase over 20 units would trigger "this looks
unusually large," which isn't a meaningful warning (there's no real baseline yet, so nothing is
actually being compared) — just noise that would train people to click through the warning without
reading it.

**Fix:** the "unusually large" check on the IN side now only applies when there's an actual
positive baseline to compare against. The OUT-side check (can't remove more than you have) is
unaffected — that one's meaningful even from zero.

*Verified:* a 500-unit first-ever stock-in for a new item no longer triggers a warning; the
existing over-current-stock OUT warning still does.

## 4. Search text and data could carry over from a previous person's session
Logging out and a different person logging back in — same browser tab, no page refresh — left
whatever the previous person had typed into any search box still sitting there, since `searchQ`
and the data arrays (`items`, `movements`, etc.) were only ever reset by the *next* Firestore
snapshot arriving, not by the act of switching users. Minor, but a real information leak across
sessions on a shared device (e.g. a shop's single tablet used by whoever's on shift).

**Fix:** every search box and the app's in-memory data arrays now reset to empty right when a
fresh session starts (`sub()`), before new listeners repopulate them.

*Verified:* typed a search term, logged out, signed in as a (mock) fresh session — search box is
empty, not showing the previous person's text.

## Also re-verified, no issues found
Re-ran the full multi-role regression (Master's 10 tabs, Actual's counting flow, Tally's 2 tabs)
after all four fixes — zero console errors, everything still works. Checked the Reverse-entry flow
specifically for a similar double-submit race: it's naturally protected already, since the
confirmation prompt is a blocking native dialog — the browser won't let a second click register
until the person responds to the first one.
