# First-run setup flow (v5)

There is no pre-created Master username/PIN in the ZIP.

On the first launch, if `/system/bootstrap` does not exist, the app displays:
1. Master name
2. Create PIN
3. Confirm PIN

It then creates the Firebase Authentication account and the Master Firestore profile automatically in one setup flow. After this first claim, the bootstrap document permanently disables first-run Master creation.

Master can then open Users and create:
- Actual Stock User
- Tally Upload User
- Additional Master

For each user, Master enters only Name + PIN + Role. The app uses a secondary Firebase Auth instance so creating another account does not log the Master out.

## Firebase Console prerequisites
Only these Firebase project-level switches are still required:
- Authentication > Email/Password must be enabled.
- Firestore Database must exist.
- Deploy/publish the included `firestore.rules`.

No manual `/users/{UID}` document creation is required anymore.

## Security
The first Master claim is allowed only while the bootstrap document does not exist. The Master user document and bootstrap marker must be created atomically and reference the same authenticated UID. Once initialized, ordinary users cannot create or change role profiles; only a Master can.
