# Qaraj — Build & Deployment Guide

This guide covers everything needed to build and publish the Qaraj app to the **Apple App Store** and **Google Play Store** using **Expo EAS Build**.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22+ | [nodejs.org](https://nodejs.org) |
| Bun | latest | `curl -fsSL https://bun.sh/install \| bash` |
| EAS CLI | 12+ | `npm install -g eas-cli` |
| Expo account | — | [expo.dev](https://expo.dev) |

---

## 1. Initial Setup

### 1.1 Install dependencies

```bash
bun install
```

### 1.2 Log in to Expo

```bash
eas login
```

### 1.3 Link the project to EAS

```bash
eas init --id <your-project-id>
```

> After running `eas init`, copy the `projectId` into `app.json` under `extra.eas.projectId`.

---

## 2. Database Setup

### 2.1 Set the DATABASE_URL

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://qaraj_app:qaraj_app7162381637@servicewebhooks.cp08geg2csn4.us-east-1.rds.amazonaws.com:5432/qaraj
OPENAI_API_KEY=your-openai-api-key
```

### 2.2 Run migrations

```bash
bun run db:push
```

### 2.3 Seed the database

```bash
bun run db/seed.ts
```

---

## 3. Push Notifications Setup

### 3.1 Configure EAS Push credentials

```bash
eas credentials
```

Select your platform (iOS / Android) and follow the prompts to generate/upload:
- **iOS**: APNs key or certificate
- **Android**: FCM server key (from Firebase Console)

### 3.2 Update the projectId in notifications.ts

In `lib/notifications.ts`, replace:
```ts
projectId: 'qaraj-app-project-id',
```
with your actual EAS project ID from `app.json`.

---

## 4. iOS Build

### 4.1 Configure Apple credentials

Update `eas.json` submit section:
```json
"ios": {
  "appleId": "your-apple-id@example.com",
  "ascAppId": "your-app-store-connect-app-id",
  "appleTeamId": "YOUR_APPLE_TEAM_ID"
}
```

### 4.2 Development build (iOS Simulator)

```bash
eas build --platform ios --profile development
```

### 4.3 Preview build (physical device via TestFlight)

```bash
eas build --platform ios --profile preview
```

### 4.4 Production build (App Store)

```bash
eas build --platform ios --profile production
```

### 4.5 Submit to App Store

```bash
eas submit --platform ios --profile production
```

---

## 5. Android Build

### 5.1 Configure Google Play credentials

1. Create a service account in [Google Play Console](https://play.google.com/console)
2. Download the JSON key file
3. Save it as `google-play-service-account.json` in the project root
4. Update `eas.json`:
   ```json
   "android": {
     "serviceAccountKeyPath": "./google-play-service-account.json",
     "track": "internal"
   }
   ```

### 5.2 Development build (APK)

```bash
eas build --platform android --profile development
```

### 5.3 Preview build (APK for internal testing)

```bash
eas build --platform android --profile preview
```

### 5.4 Production build (AAB for Play Store)

```bash
eas build --platform android --profile production
```

### 5.5 Submit to Google Play

```bash
eas submit --platform android --profile production
```

---

## 6. Both Platforms at Once

```bash
# Build both
eas build --platform all --profile production

# Submit both
eas submit --platform all --profile production
```

---

## 7. Over-the-Air Updates (OTA)

For JavaScript-only changes (no native code changes), use EAS Update to push updates instantly without going through the App Store review:

```bash
# Install EAS Update
npx expo install expo-updates

# Publish an update
eas update --branch production --message "Fix appointment booking bug"
```

---

## 8. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI spare parts search | Yes |
| `NODE_ENV` | `development` / `staging` / `production` | Yes |

Set these in `eas.json` under each build profile's `env` section, or use EAS Secrets:

```bash
eas secret:create --scope project --name OPENAI_API_KEY --value sk-...
```

---

## 9. App Store Metadata Checklist

Before submitting to the App Store / Google Play:

- [ ] App icon (1024×1024 PNG, no alpha) at `assets/images/icon.png`
- [ ] Splash screen at `assets/images/splash-icon.png`
- [ ] Android adaptive icon at `assets/images/adaptive-icon.png`
- [ ] Notification icon (white, transparent bg) at `assets/images/notification-icon.png`
- [ ] Notification sound at `assets/sounds/notification.wav`
- [ ] `google-services.json` (Firebase) for Android push notifications
- [ ] App Store screenshots (6.7", 6.1", iPad)
- [ ] Google Play screenshots (phone, 7" tablet, 10" tablet)
- [ ] Privacy policy URL
- [ ] App description and keywords

---

## 10. Bundle Identifiers

| Platform | Bundle ID |
|----------|-----------|
| iOS | `az.qaraj.app` |
| Android | `az.qaraj.app` |

These are set in `app.json` and must match your App Store Connect and Google Play Console entries.
