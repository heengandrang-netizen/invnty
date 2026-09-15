# v10.7.1 — actual root cause of the desktop layout bug

The four earlier layout releases (v10.3, "corrected shell" in v10.3's own second block, v10.4,
v10.7) all patched **CSS only**. The real bug was in the **HTML**, so none of them could have
worked, and each one left its now-dead `.app.master-shell` grid rules sitting in the stylesheet
where they kept quietly re-matching the DOM.

## What was actually wrong

1. **Malformed markup in `shell()`.** The topbar template was missing one `</div>`. `.grow`
   and `.row.topbar` were never explicitly closed, so the browser's error-recovery silently
   nested the pill/Logout button inside `.grow`, and nested the **entire** `.workspace-shell`
   (nav + every tab's content) inside `.row.topbar` instead of beside it. Confirmed in a real
   Chromium DOM: `document.getElementById('app').children.length` was `1`, not `2`.

2. **Three superseded `.app.master-shell{display:grid...}` rule sets** (from the v10.2, v10.3
   and v10.4 style blocks) were still present and still matched `#app`, even though v10.7
   introduced the new `.workspace-shell` / `.workspace-content` grid and never removed them.
   Because `.app.master-shell` (2 classes) is more specific than the plain `.app` rule v10.7
   added, the old grid kept winning. A stray, non-`!important` `.app.master-shell nav{grid-column:1;
   grid-row:2/4}` (from v10.2) also kept mis-placing `nav` inside `.workspace-shell`'s grid even
   after the DOM was fixed.

Fixing only #1 was not enough — verified with a real render: DOM was correct but the layout was
still visually broken until #2 was also removed.

## What changed in this patch

- `index.html` — added the missing `</div>` in `shell()`.
- `index.html` — removed the three dead `.app.master-shell` desktop-grid rule sets (v10.2, v10.3,
  v10.4 blocks). All of that behavior is already correctly provided by the v10.7
  `.workspace-shell` / `.workspace-content` rules.
- `index.html` — updated the v10.6 polish block's `.app.master-shell>nav...` selectors to
  `.workspace-shell>nav...` (they no longer matched the current DOM at all) and restored the
  Warm Ivory active-tab color (sage background, `#3f6c5b` text) that had only existed in one of
  the now-removed v10.3 rules.
- `sw.js` — bumped cache name to `stocksync-v10.7.1-layout-fix` so returning users actually get
  this build instead of the previously cached broken one.
- `index.html` — title bumped to `v10.7.1 Layout Fixed`.

No JavaScript logic, Firestore calls, or security rules were touched by this patch — verified the
extracted module still passes `node --check`. Verified visually with a real Chromium render:
Master desktop (≥1100px) now shows the intended 238px sidebar + full-width content workspace;
tablet and mobile are unchanged (they already worked because their CSS paths never depended on
`.app.master-shell`'s grid).

## Not fixed in this patch (see the separate QA review for details)

Everything else from `INDEPENDENT-QA-REVIEW.md` — write-only audit collections, no Firestore
offline persistence, unbounded `movements`/`countEntries` listeners, etc. — is unrelated to this
layout bug and left as-is.
