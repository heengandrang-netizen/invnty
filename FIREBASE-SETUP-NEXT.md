# Firebase project configured

Project ID: invntry-a85e6

The web configuration has been added to firebase-config.js.

## Required one-time Firebase Console setup

1. Authentication > Sign-in method > enable Email/Password.
2. Authentication > Users > Add user.
   Email: master@inventory.local
   Password/PIN: choose a password accepted by Firebase Authentication (for example 123456).
3. Copy the new user's UID.
4. Firestore Database > create database.
5. Create collection `users`, document ID = that exact UID, with fields:
   - username (string): master
   - displayName (string): Master
   - role (string): master
   - active (boolean): true
6. Deploy the included firestore.rules.

After this, app login:
Username: master
PIN: the password chosen in step 2.

Important: the Firebase Web API key is expected to be present in a web app and is not an Admin secret. Access control is enforced by Authentication + Firestore Security Rules. Do not put service-account/Admin private keys in the frontend.
