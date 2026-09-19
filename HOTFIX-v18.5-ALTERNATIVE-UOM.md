# StockSync Pro v18.5 — Alternative UOM

## What changed
Master can now create, edit and remove multiple Alternative UOM conversions for each product.

Example:
- Base/Tally UOM: Piece
- 1 Box = 12 Piece
- 1 Case = 144 Piece

## Compatibility
- Existing `packUnit` / `packSize` records are automatically exposed as the first Alternative UOM.
- The first Alternative UOM is still mirrored into `packUnit` / `packSize` so older Tally/import/history logic remains compatible.
- No data migration is required.

## Actual Count
Actual Count users can select any configured Alternative UOM and enter:
- Base unit only
- Alternative UOM only
- Alternative UOM + Base unit

All entries are normalized to the Base/Tally quantity before saving.

## Tally import
When a Tally row contains a secondary UOM, StockSync now compares that conversion against the matching Alternative UOM instead of assuming there is only one packing unit.

## Validation
The Master editor blocks:
- empty Alternative UOM names
- zero/negative conversion factors
- duplicate Alternative UOM names
- an Alternative UOM identical to the Base/Tally UOM
- Alternative UOM setup without a Base/Tally UOM

Unit-conversion changes continue to be written to `unitConversionHistory`, now including old/new Alternative UOM arrays.

## Security
No Firestore rule change is required for this feature. Item Master writes remain Master-only.
