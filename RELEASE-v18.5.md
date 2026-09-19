# Release v18.5

Adds Master-managed multiple Alternative UOMs while preserving legacy pack-unit compatibility.

Key additions:
- multiple Alternative UOM rows per item
- create / edit / remove conversions from Item Master
- primary conversion mirrored to legacy `packUnit` / `packSize`
- Actual Count can count using any Alternative UOM
- Smart Search indexes Alternative UOM names
- Tally UOM conversion mismatch checks use the matching configured Alternative UOM
- conversion audit history records old/new Alternative UOM sets
- Item Master form is protected from unrelated realtime re-renders while editing

No Firestore rules update is required specifically for v18.5.
