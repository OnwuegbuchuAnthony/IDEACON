# IDEACON Android APK

This branch contains an Android WebView shell for the deployed IDEACON Next.js app.

## Build

A push to Android files or the push-notification backend on this branch, or a manual workflow dispatch, builds a debug APK with GitHub Actions. Download the `ideacon-android-debug-apk` artifact from the workflow run.

## Included

- Loads https://ideacon.vercel.app in Android WebView
- WebView cookies/DOM storage for existing web login and checkout
- System file picker for website file uploads
- Runtime geolocation permission, restricted to ideacon.vercel.app
- Offline/network-error screen with retry
- Android notification channel and Firebase Cloud Messaging receiver
- Authenticated per-user token registration at `/api/push/register`
- Admin-only server-side sender at `/api/push/send`

## Configure Firebase Cloud Messaging

The Firebase project and service account must belong to the IDEACON operator. The repository does not contain Firebase credentials.

1. Open https://console.firebase.google.com/ and create a project named `IDEACON` (or select an existing project if you later create one).
2. In Project settings → General → Your apps, choose **Add app → Android**. Set Android package name exactly to `com.ideacon.app`. App nickname is optional; SHA certificate is not needed for basic FCM delivery.
3. Download the generated `google-services.json`.
4. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret** for this repository. Name it `ANDROID_GOOGLE_SERVICES_JSON` and paste the full contents of `google-services.json`. Do not commit this file.
5. In Firebase Console → Project settings → Service accounts, generate a private key for the Firebase Admin SDK. Keep the JSON file private. In Vercel → project `ideacon` → Settings → Environment Variables, add `FIREBASE_SERVICE_ACCOUNT_JSON` with the entire service-account JSON as the value for **Production** (and Preview only if needed). Do not use a client-side `NEXT_PUBLIC_` variable.
6. Apply the new Prisma model to the production database once: from the `app` directory run `npx prisma db push` using the production `DATABASE_URL` in a trusted environment. Do not paste database credentials into chat. Confirm the `push_token` table exists before testing registration. Deploy the branch to Vercel after the schema is updated.
7. Push any Android/backend changes to `android-apk` or manually run the **Build IDEACON Android APK** workflow. The workflow embeds the Firebase Android config from the GitHub secret in the build workspace only and uploads the APK artifact.
8. Sign in to IDEACON in the Android app and allow notifications. Token registration is attempted when a page loads while the Better Auth session is active.

### Sending a test push

Only a signed-in IDEACON user whose role is `ADMIN` can call the sender. Send a POST to `https://ideacon.vercel.app/api/push/send` with the authenticated admin session cookie and JSON such as:

```json
{
  "userIds": ["TARGET_ID_FROM_IDEACON"],
  "title": "IDEACON test",
  "message": "Push notifications are connected.",
  "path": "/notifications"
}
```

Use a trusted admin session and the existing authenticated browser/API tooling; never expose session cookies. The endpoint targets only the supplied user IDs and does not support anonymous or public sending.

## Credentials and limitations

- Never commit Firebase service-account JSON, private keys, signing keys, or production secrets.
- `ANDROID_GOOGLE_SERVICES_JSON` is a GitHub Actions repository secret. `FIREBASE_SERVICE_ACCOUNT_JSON` is a server-only Vercel environment variable.
- A Firebase project and both secrets are still required for actual push delivery; the APK can build without them, but push will not work.
- The current build workflow produces a debug APK. Production distribution requires a separately protected release signing key.
- Accounts and Paystack checkout remain web-based and require internet access.

## Offline limitations

The app displays an offline screen if the website cannot load. Authenticated server data, checkout, and API actions still require connectivity. This is not a full offline-first rewrite.
