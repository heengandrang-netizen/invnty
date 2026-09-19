> **v18.5:** Master can create/edit multiple Alternative UOMs per product (e.g. Box, Case), legacy single-pack conversions remain compatible, Actual Count can use any configured Alternative UOM, and Tally conversion checks match the correct UOM. See `HOTFIX-v18.5-ALTERNATIVE-UOM.md`.

> **v18.4.1:** Zero-stock Tally import now treats 0 as a real stock value, supports 0-with-unit/NIL/dash values, can treat matched blank closing balances as zero, and highlights Tally=0 vs positive physical stock as a dedicated mismatch. See `HOTFIX-v18.4.1-ZERO-STOCK.md`.

> **v18.4:** Tally Easy Import removes avoidable import blockers. Valid unmatched Tally rows are auto-created (restricted for Tally users), no-quantity rows are ignored, exact same-value duplicates are auto-skipped, and only risky conflicts show an inline Fix Issues panel. See `HOTFIX-v18.4-TALLY-EASY-IMPORT.md`.

> **v18.3:** Smart Search adds typo-tolerant English/Hinglish/Hindi inventory discovery for Actual Count. See `HOTFIX-v18.3-SMART-SEARCH.md`.

> **Hotfix:** v18.2.2 fixes Actual Stock user inventory/count visibility and automatically starts a safe daily count session when none is open. See `HOTFIX-v18.2.2.md`.

> **Hotfix:** v18.2.1 fixes User & Rights → Edit User UI/reset behavior. See `HOTFIX-v18.2.1.md`.

# StockSync Pro v18.5 — Setup

## Included
- Installable mobile-first PWA
- Firebase Authentication login using username + PIN convention
- Firestore realtime sync (listeners; no wasteful full refresh every 5 sec)
- Roles: master / actual / tally
- Tally Excel/CSV upload with automatic matching, safe new-item creation, inline issue resolution and rollback
- Item master + multiple Tally aliases + multiple Master-managed Alternative UOM conversions
- Actual physical stock entry + immutable history
- Tally vs Actual reconciliation and CSV report
- Daily IN/OUT transaction log
- Firestore Security Rules

## Firebase setup
1. Create a Firebase project and Web App.
2. Enable Authentication > Email/Password.
3. Create Firestore database.
4. Paste the Web App config into `firebase-config.js`.
5. Deploy the included `firestore.rules`.
6. Open the app. On a brand-new database the first-run screen creates the one initial Master account. After bootstrap is complete, normal users are created from **Master > Users & Rights**.

The first-Master setup is permanently disabled after `/system/bootstrap` is created.

## User roles
- `master`: full app, setup, users, Item Master, Tally, actual stock, reports and approvals.
- `actual`: physical-count workspace only; Tally quantities remain inaccessible.
- `tally`: Tally stock/import and movement workflows; actual stock remains inaccessible. During a processing Tally import, this role may create only tightly-restricted auto-imported Item Master records; it cannot otherwise edit Item Master.

## Deploy
Install Firebase CLI, login, initialize/use the project, then:
`firebase deploy --only firestore:rules,hosting`

## Tally import
Export inventory from Tally to XLSX/CSV. Upload it and preview the detected columns. Existing items match automatically. Valid unmatched rows with quantity are created automatically; blank-quantity rows are ignored; exact same-value duplicates are de-duplicated. Only risky conflicts need a decision in the inline Fix Issues panel. Tally-created new items are marked `Imported · review` for Master but do not block stock import.

## Security behavior
- Actual role can read item names and only actual-stock data; it cannot read Tally quantities or reports.
- Tally role can read item names and only Tally stock/import data; it cannot read actual stock.
- Master can read and manage all operational data.


## v2 additions
Count sessions + lock/reopen reason; blind counting; dual-count sensitive items; variance investigation workflow and master resolution approval log; immutable Tally snapshot history; duplicate file hash protection; suspicious quantity checks; alias suggestions; risk dashboard and repeated variance detection; richer IN/OUT ledger; period-labelled exports; improved service-worker cache update behavior. Location/godown hierarchy and barcode/QR scanning are intentionally NOT included per request.
