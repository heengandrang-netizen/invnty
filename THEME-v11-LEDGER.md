# v11 — Ledger: cool-corporate dark theme

Replaces the Warm Ivory light theme with a dark, restrained "Stripe/Linear-style" palette. This
was also the moment to finally consolidate the stylesheet: the app had accumulated **8 separate
`<style>` blocks** (v1–v7 base, v8, v9, v10.2, v10.3, v10.4, v10.6, v10.7) with several full
`:root` variable redeclarations layered on top of each other — the same root cause of the layout
bug fixed in v10.7.1. This release replaces all of them with **one** stylesheet.

## Design plan

**Color** — canvas `#0A0D13`, surface `#131822`, line `#242C3B`, ink `#ECEEF3`, muted `#8891A6`,
gold `#C9A45C`. Gold is the single working accent — buttons, active nav, focus highlights on the
logo mark, brand mark — used with restraint rather than sprinkled across the UI. A cool blue
`#7B9BD1` is kept for input/button focus rings and as a second gradient stop (progress bars, the
logo mark, the accent bar on KPI cards), so it has a real functional job rather than competing
with gold for attention. Status colors (success green / danger red / warning amber) stay clearly
separate from both accents so table data is never ambiguous.

**Type** — Manrope throughout (one family, weights 400–800), tabular figures on all numbers.
Dense data screens read better from one consistent, well-weighted face than a second display
typeface.

**Layout** — unchanged. This pass is presentation-layer only; the grid/shell structure fixed in
v10.7.1 and the search feature added in v10.8 were not touched.

## What else changed, and why

A few small copy/markup changes came out of actually looking at this with fresh eyes rather than
just recoloring the existing markup:

- Dropped the **"WORKSPACE"** all-caps label that sat above the sidebar nav — the nav is
  self-explanatory from its own tab labels, and the label wasn't doing any real work.
- The topbar used to read `Inventory Control Center · Master Test · master` — a redundant product
  name plus two middle-dot-joined values. It's now just the person's name next to a small role
  badge (`Master Test` `MASTER`), which is easier to scan and matches how the Users tab already
  shows roles.
- Dropped the literal word **"Premium"** from the header badge and the login subtitle (it now says
  "LEDGER" and "Inventory Audit & Reconciliation") — a design should read as premium rather than
  announce itself as one.
- `manifest.json` theme/background colors updated to match, so the PWA splash screen and installed
  icon background aren't a light-blue flash before a dark app.

## Verification

Checked with a real Chromium render (Playwright) against every tab (Dashboard, Item Master, Tally
Upload, Variance, Users, Reports, IN/OUT), the login/first-setup screen, and mobile/tablet/desktop
widths. Also re-ran the v10.8 search regression check — typing in each search box still keeps
focus and filters correctly; only the CSS around it changed.

## Note on the font

`Manrope` loads from Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`). If you're running
this somewhere without outbound internet access (a fully offline kiosk, an intranet with a locked
allowlist), the page still works — it falls back to the system UI font — but for the intended look
those two domains need to be reachable, same as the existing CDN dependency on `cdn.jsdelivr.net`
for the xlsx/PDF export libraries.
