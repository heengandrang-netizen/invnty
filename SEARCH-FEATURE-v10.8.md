# v10.8 — Search added to every Master item-list tab

Previously the only search box in the app was on the **Actual Count** screen (Actual role,
filtering their own count session). Master had no way to search — every other screen required
scrolling the full table to find one item.

## What's new

Search boxes added to all five item-list tabs that Master uses:

| Tab | Filters | Matches |
|---|---|---|
| **Item Master** | The item/alias table | Item name or any alias |
| **Dashboard** | The "Tally vs Actual" table | Item name or any alias |
| **Reports** | The on-screen "Tally vs Actual" table | Item name or any alias — **downloads (Excel/PDF) still include every item, unaffected by the search box** |
| **IN / OUT (Movement)** | The transaction ledger table | Item name of the transaction |
| **Variance** | The open-variance table | Item name or any alias |

All searches are case-insensitive substring matches, and match against Tally aliases too — so
searching `"namak"` finds an item named "Salt 1kg" if `"Namak"` is one of its aliases. This
mirrors and reuses the same matching style as the existing Actual Count search.

## Implementation notes

- A single `matchItem(item, query)` helper and `searchBox(id, value)` template are shared by all
  five tabs, instead of five separate implementations.
- Each tab's typed query is kept in a small `searchQ` state object so a live Firestore update
  (e.g. someone else editing an item elsewhere) doesn't wipe out what you've typed — the existing
  Actual Count search did not have this protection and would reset on every snapshot.
- Typing filters only the table body (`oninput` updates a dedicated sub-container), never the
  search box itself — this avoids the common bug where re-rendering the whole card on every
  keystroke destroys and recreates the input, kicking focus out after each character. Verified by
  scripting real character-by-character typing in a browser and confirming focus never leaves the
  input.
- Item Master's Edit button handlers are re-bound after every filter (they live inside the
  filtered rows), verified working after a search is active.
- The IN/OUT item picker (`<select>`) also got a blank "— Select item —" default option while I
  was in this function — it previously silently pre-selected the first item in the list, which was
  flagged as a minor data-entry risk in the earlier QA review.

## Not changed

Tally role's screen wasn't touched — it's an upload + import-history view, not an item list, and
wasn't part of this request. No Firestore rules, security logic, or existing screens outside the
five listed above were modified.
