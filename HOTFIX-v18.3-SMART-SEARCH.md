# StockSync Pro v18.3 — Smart Search

## Added
- Typo-tolerant fuzzy product search for Actual Count and other item-search surfaces.
- Hindi/Devanagari transliteration so phonetic product names can be found even when typed in Hindi.
- Common Hindi ↔ English inventory synonyms (e.g. पेंच → screw, तार → wire, चाबी → spanner/wrench).
- Hinglish/common misspelling assistance (e.g. bairing/bering → bearing, skru → screw, bolat → bolt).
- Devanagari digit handling (e.g. २५ → 25) and common Hindi unit words (एमएम, इंच, पीस, etc.).
- Word-order tolerant multi-token matching and relevance ranking.
- Existing Item Master aliases, SKU/code/barcode/part-number fields (when present), units and packing units participate in search.
- “Best match” badge on the highest-ranked result.
- Item Master alias hint now explicitly supports Hindi/Hinglish local names.
- 70 ms input debounce plus cached item search documents for responsive mobile use.

## Examples tested
- `bairing`, `बेयरिंग`, `bering 6204` → Bearing product
- `skru`, `स्क्रू`, `पेंच`, `दो इंच पेंच` → Screw product
- `bolat`, `बोल्ट` → Bolt product
- `तार` → Wire product
- `पंखा`, `pankha` → Fan product
- `पाइप २५ एमएम` → 25 mm pipe
- `चाबी 10`, `pana 10` → 10 mm spanner/wrench

## Deployment
No Firestore rule change is required for this search-only release. Deploy the updated website files, including `index.html` and `sw.js`, so the new cache key replaces older PWA assets.
