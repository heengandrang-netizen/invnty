# v12 — Smart Tally Import: auto-create items with detected UOM

Built directly from a real Tally export the user shared (971 items, a Holi-colour/pooja-items
wholesaler's stock list). That file shaped the whole design, so this doc explains the file format
as much as the feature — future uploads from the same Tally setup should look the same way.

## What that file actually looks like (and why it's tricky)

- **No header row.** Data starts at row 1: Column A = item name, columns B/C = quantity.
- **No visible unit column.** Tally's XLSX export embeds the unit as a custom **cell number
  format** (e.g. a cell showing `88` has number format `"0" pc."`, meaning "88 pc." — the "pc."
  never appears in the cell's actual value, only in how Excel is told to display it). This is
  invisible unless you inspect the cell's format, not just its value.
- **Two quantity columns aren't two different things** — they're the **same stock shown in two
  units** (Tally's Primary Unit + Alternate Unit), e.g. `150 Piece` and, in the next column,
  `2.5 Case` for the same item. Confirmed by checking: across all 345 rows in the sample file
  that had both columns filled, the **larger number was always the finer unit** (Piece/Kg/Packet)
  and the **smaller number was always the coarser pack unit** (Case/Box/Bag) — zero exceptions.
  That's now a rule in the code, not a guess: *larger quantity = base unit, smaller = pack unit,
  `packSize` = base ÷ pack*.

## What the upload screen does now

1. **Works with or without a header row** — a checkbox says which. Previously the app assumed
   row 1 was always a header; a file like this one would have silently used the first real item
   as if it were a column name.
2. Shows a **raw preview** (column letters, first 6 rows, detected unit shown next to each number)
   before asking which column is what — so you can see what the file actually contains, including
   units, before committing to a mapping.
3. Three column pickers: **Item name**, **Primary quantity**, **Alternate/case quantity**
   (optional — leave blank for files that only have one quantity column).
4. On "Preview Import", every row is classified into one of four buckets, all shown in the
   summary and the row table:
   - **Update stock** — name matches an existing item.
   - **New item, with stock** — no match found, and a usable quantity was read; will be created
     with `unit`, `packUnit` and `packSize` filled in from the detected units and computed ratio.
   - **New item, no stock yet** — no match, and no quantity in the row (name-only rows, 544 of
     them in the sample file). Still created, so your item list matches Tally's, just without a
     stock figure to enter — the unit fields stay blank for you to fill in later.
   - **Needs attention** — duplicate name within the file, an alias that ambiguously matches more
     than one existing item, or a negative/invalid quantity (Tally shows small negative numbers
     sometimes after cost adjustments — real stock, positive or zero. Negative rows are excluded
     from the import rather than silently written as negative stock).
5. **Only Master can create new items.** The Tally role can still upload files and update stock
   for items that already exist — same as before — but if a file has unmatched rows, a Tally-role
   user sees a message asking them to have Master review it, instead of a create button. This
   wasn't a new rule I added — it's how `firestore.rules` already worked (`items` writes require
   `master()`), so this just makes the UI match the permission that was already enforced
   server-side, rather than the button being there and silently failing for a Tally user.

## Verified with the real file

Ran the sample file through the actual code in a browser (not just read the logic): 425 rows
became new items with stock, 544 became name-only items, 2 negative-quantity rows were correctly
excluded and flagged, and spot-checked several created items' computed `packSize` against the
source numbers by hand (e.g. "Bankey Bihari Kapoor 100gm" → 150 Piece / 2.5 Case → packSize 60,
exactly right). Re-ran it with one item pre-seeded to confirm the "existing item" path still only
touches `stockLatest`, never overwrites the item's own name/unit/aliases.

## CSV files

CSV has no cell formatting at all, so unit auto-detection only works for `.xlsx`/`.xls` uploads.
A CSV still imports — you'll just need to type the unit into each new item afterward from Item
Master, same as adding an item manually.
