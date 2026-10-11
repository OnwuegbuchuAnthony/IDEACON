# IDEACON Android APK

This branch contains an Android WebView shell for the deployed IDEACON Next.js app.

## Build

A push to this branch or a manual workflow dispatch builds a debug APK with GitHub Actions. Download the `ideacon-android-debug-apk` artifact from the run.

## Included

- Loads https://ideacon.vercel.app in Android WebView
- WebView cookie/DOM storage for existing web login and checkout
- System file picker for website file uploads
- Runtime geolocation permission, restricted to ideacon.vercel.app
- Offline/network-error screen with retry
- Android notification channel and Firebase Cloud Messaging receiver scaffold

## Push notifications setup

Actual push delivery requires a Firebase project owned by the IDEACON operator.

1. Create/register an Android app in Firebase with package ID `com.ideacon.app`.
2. Download the Firebase `google-services.json` configuration.
3. Add it to GitHub repository Actions secrets as `ANDROID_GOOGLE_SERVICES_JSON` (paste the full file contents).
4. Configure a server-side sender using Firebase Admin credentials in the deployment environment and register device tokens against the authenticated IDEACON user. Do not put service-account private keys in this repository or the Android app.

Without the Firebase config and server-side sender, the APK still builds, but push notifications will not be delivered.

## Payments and accounts

The app uses the existing HTTPS website, so Better Auth sessions and the Paystack checkout flow remain web-based. Payment verification remains server-side on the existing backend.

## Offline limitations

The app displays an offline screen if the website cannot load. Authenticated server data, checkout, and other API actions still require connectivity. This is not a full offline-first rewrite.
