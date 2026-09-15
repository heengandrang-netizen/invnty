# v10.7 structural layout fix
The screenshot confirmed the old CSS-only approach was still being overridden.

This build changes the rendered DOM:
- `workspace-shell` directly owns sidebar + content.
- `workspace-content` directly owns hero + main.
- Desktop is deterministically 238px + remaining width.
- Tablet becomes horizontal navigation.
- Mobile becomes bottom navigation.
- No dependency on the app root grid or CSS `:has()`.
- v10.6 functional/security fixes remain.
