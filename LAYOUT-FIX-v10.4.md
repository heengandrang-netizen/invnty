# v10.4 deterministic layout fix
The screenshot showed the navigation expanding full-width. The desktop layout selector was not being applied reliably.

Fix:
- Master shell now gets an explicit `master-shell` CSS class from JavaScript.
- Removed dependency on CSS `:has(...)` for desktop architecture.
- Desktop layout is deterministically 238px sidebar + flexible content workspace.
- Header spans both columns.
- Hero and all dashboard content stay in right column.
- Warm Ivory / cream theme is preserved.
- Mobile/tablet rules remain intact.
