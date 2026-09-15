# Multi-unit Actual Stock Counting

Each item can define:
- Tally/Base Unit (e.g. Piece)
- Packing Unit (e.g. Carton)
- Conversion (e.g. 1 Carton = 100 Pieces)

Actual Stock users can enter the same stock as:
- 150 Pieces
- 1.5 Cartons
- 1 Carton + 50 Pieces

All inputs normalize to 150 Pieces internally before comparison with Tally. The original entry mode and quantities are retained in count history for auditability. Tally quantity remains hidden from Actual users.
