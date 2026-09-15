# Name + PIN Login

The login screen now asks only for:
- Name
- PIN

No email address is shown to the user.

Internally, Firebase Authentication still requires an identifier. The app converts the entered name to an internal email alias:
`<normalized-name>@inventory.local`

Examples:
- `Master` -> `master@inventory.local`
- `Ramesh Kumar` -> `ramesh.kumar@inventory.local`

PIN must be 4–12 numeric digits in the app UI. Note that Firebase Email/Password authentication may enforce its own minimum password length when the account is created; use at least 6 digits for maximum compatibility.

For the initial master:
- Visible Name: Master
- Firebase Auth email: master@inventory.local
- PIN/password: e.g. 123456
- Firestore user profile: username=master, displayName=Master, role=master, active=true

The internal email is never requested from normal app users.
