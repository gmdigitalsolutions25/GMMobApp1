# Firebase Cloud Messaging (FCM) Setup Guide for Qaraj GM

**Version:** 2.0
**Date:** April 29, 2026
**Status:** Pending — Requires Firebase Console access

This guide walks through setting up Firebase and `google-services.json` to enable **push notifications** on Android for the Qaraj GM app.

## Current Status

| Component | Status |
|-----------|--------|
| `app.json` — `googleServicesFile` reference | ✅ Configured |
| `expo/lib/notifications.ts` — Push token logic | ✅ Implemented (uses tRPC) |
| `auth.tsx` / `pin-login.tsx` — Token registration after login | ✅ Wired |
| `pushTokens.register` backend endpoint | ✅ Deployed |
| `pushTokens.send` backend endpoint | ✅ Deployed |
| `push_tokens` database table | ✅ Created |
| `google-services.json` file | ❌ **MISSING — Blocks push notifications** |
| Firebase project creation | ❌ **Requires Google account login** |

**Without `google-services.json`, `getExpoPushTokenAsync()` returns null on Android and push token registration silently fails.**

## Prerequisites

- Google account with access to [Firebase Console](https://console.firebase.google.com/)
- Android package name: `az.qaraj.app`
- Access to the Qaraj-GM GitHub repo

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `Qaraj GM` (or `qaraj-gm`)
4. Disable Google Analytics (not needed for push notifications)
5. Click **"Create project"**

## Step 2: Add Android App to Firebase

1. In the Firebase project dashboard, click the **Android icon** to add an app
2. Enter the Android package name: **`az.qaraj.app`**
3. App nickname: `Qaraj GM`
4. SHA-1 certificate fingerprint: **skip for now** (can add later for production)
5. Click **"Register app"**

## Step 3: Download google-services.json

1. Firebase will prompt you to download `google-services.json`
2. Click **"Download google-services.json"**
3. Save it to the repo at: **`expo/google-services.json`**

## Step 4: Update app.json

Add the `googleServicesFile` reference to the Android config in `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "az.qaraj.app"
    }
  }
}
```

This line tells EAS Build to include the Firebase config in the APK.

## Step 5: Add EAS Project ID (if not already set)

Push notifications via Expo require an EAS project ID. If not already configured:

1. Run `npx eas init` in the `expo/` directory (or set it manually)
2. This adds `extra.eas.projectId` to `app.json`:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id-here"
      }
    }
  }
}
```

Without this, `getExpoPushTokenAsync()` will fail.

## Step 6: Enable Cloud Messaging API

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click the **"Cloud Messaging"** tab
3. Ensure **"Firebase Cloud Messaging API (V1)"** is **Enabled**
4. If it shows "Disabled", click the link to enable it in Google Cloud Console

## Step 7: Get the FCM Server Key (for backend)

For sending push notifications from the backend server:

### Option A: Expo Push Service (Recommended)

Expo handles FCM delivery for you. No server key needed. Just send to Expo's push API:

```
POST https://exp.host/--/api/v2/push/send
Content-Type: application/json

{
  "to": "ExponentPushToken[xxxx]",
  "title": "Service Due Soon",
  "body": "Your Toyota Camry is due for service in 3 days.",
  "data": { "type": "service" }
}
```

### Option B: Direct FCM (Advanced)

1. In Firebase Console → Project Settings → **Service Accounts**
2. Click **"Generate new private key"**
3. Save the JSON file securely on the backend server
4. Use the Firebase Admin SDK to send notifications

## Step 8: Build and Test

1. Commit `google-services.json` to the repo
2. Build a new APK:
   ```bash
   cd expo
   npx eas build --platform android --profile preview
   ```
3. Install the APK on a physical device
4. Grant notification permissions when prompted
5. The app will automatically register the push token with the backend

## Step 9: Verify Push Token Registration

Check the `push_tokens` table in the database:

```sql
SELECT * FROM push_tokens ORDER BY created_at DESC LIMIT 5;
```

You should see entries with the Expo Push Token for each device.

## Step 10: Send a Test Notification

Using Expo's push notification tool:

1. Go to [Expo Push Notification Tool](https://expo.dev/notifications)
2. Enter the Expo Push Token from the database
3. Set title and body
4. Click **"Send a Notification"**
5. The notification should appear on the device

## Architecture Overview

```
User's Phone
  └── Qaraj GM App
        ├── expo-notifications (receives & displays)
        ├── Registers Expo Push Token → Backend API
        └── Local notifications (appointment reminders)

Backend Server (91.107.161.67)
  ├── push_tokens table (stores device tokens)
  └── Sends via Expo Push API → Expo servers → FCM → Device
```

## File Locations

| File | Purpose |
|------|---------|
| `expo/google-services.json` | Firebase config (YOU ADD THIS) |
| `expo/app.json` | Plugin config + googleServicesFile reference |
| `expo/lib/notifications.ts` | All notification logic (permissions, scheduling, storage) |
| `expo/app/_layout.tsx` | Notification listeners + deep linking |
| `expo/app/notifications.tsx` | Notification screen (clickable cards) |
| `expo/backend/trpc/routes/push-tokens/register/route.ts` | Backend push token storage |
| `expo/backend/trpc/routes/push-tokens/send/route.ts` | Admin push notification sending |
| `expo/db/schema.ts` | `push_tokens` table schema |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `getExpoPushTokenAsync` returns null | Missing `google-services.json` — complete Firebase setup |
| `getExpoPushTokenAsync` fails | Add `extra.eas.projectId` to app.json (already configured: `76b96668-e97c-4609-a448-d655ae30ec2d`) |
| Notifications not received | Check permissions, ensure physical device (not emulator) |
| Token not registered in DB | Check backend logs, verify `push_tokens` table exists |
| `google-services.json` not found | Must be at `expo/google-services.json`, referenced in app.json |
| Badge count stuck | Kill and reopen app, or pull-to-refresh on notifications screen |

## Security Notes

- **Never commit FCM server keys** to the repo
- `google-services.json` is safe to commit (it's a client-side config, not a secret)
- Push tokens are stored per-device and can be deactivated
- Rate limiting is applied to the `pushTokens.register` endpoint
