# StockSync Pro v18.2 — Setup

## Included
- Installable mobile-first PWA
- Firebase Authentication login using username + PIN convention
- Firestore realtime sync (listeners; no wasteful full refresh every 5 sec)
- Roles: master / actual / tally
- Tally Excel/CSV upload, column selection, preview, alias matching and import
- Item master + multiple Tally aliases
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
- `tally`: Tally stock/import and movement workflows; actual stock remains inaccessible.

## Deploy
Install Firebase CLI, login, initialize/use the project, then:
`firebase deploy --only firestore:rules,hosting`

## Tally import
Export inventory from Tally to XLSX/CSV. Upload it, select the item-name and quantity columns, preview matches, then commit. Use aliases in Item Master where Tally naming differs from the actual item name.

## Security behavior
- Actual role can read item names and only actual-stock data; it cannot read Tally quantities or reports.
- Tally role can read item names and only Tally stock/import data; it cannot read actual stock.
- Master can read and manage all operational data.


## v2 additions
Count sessions + lock/reopen reason; blind counting; dual-count sensitive items; variance investigation workflow and master resolution approval log; immutable Tally snapshot history; duplicate file hash protection; suspicious quantity checks; alias suggestions; risk dashboard and repeated variance detection; richer IN/OUT ledger; period-labelled exports; improved service-worker cache update behavior. Location/godown hierarchy and barcode/QR scanning are intentionally NOT included per request.
