# v10 User Administration
Master has full access to all StockSync Pro modules.

User management now supports:
- Create user + PIN + role
- Edit display name
- Change role: Actual / Tally / Master
- Enable / disable user access
- Delete/disable an app user while retaining historical audit records
- Protect the currently logged-in Master from deleting/disabling/demoting itself
- Append-only user administration audit trail

Important: A browser-only Firebase client cannot securely delete another person's Firebase Authentication credential or reset that credential without a trusted Admin SDK backend/Cloud Function. Therefore Delete immediately disables the app profile so access is blocked, while retaining audit/history. Full Auth-account deletion should be added through a callable Cloud Function in a production deployment.
