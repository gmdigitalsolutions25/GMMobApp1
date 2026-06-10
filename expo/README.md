# Qaraj GM — Mobile App & Backend

This repository contains the full source code for the **Qaraj GM** mobile application and its Node.js/Hono backend. The platform serves Group Motors customers in Azerbaijan, providing vehicle registration, appointment booking, service history, and AI-powered spare parts advisory.

## Architecture Overview

- **Frontend**: React Native (Expo SDK 54), TypeScript, Expo Router, NativeWind, tRPC Client
- **Backend**: Node.js (v22), Hono, tRPC Server, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Deployment**: Windows Server (NSSM) for backend, EAS Build for Android APK/AAB

## Documentation

Full documentation is available in the `docs/` folder at the root of the repository:

1. `01-Business-Requirements.md` — Features, user journeys, and acceptance criteria
2. `02-Technical-Architecture.md` — System design, security, and data models
3. `03-API-Reference.md` — Complete tRPC endpoint documentation
4. `04-Service-Desk-Dashboard.md` — Admin monitoring dashboard spec
5. `05-Server-Infrastructure.md` — Server paths, deployment commands, and environment variables

## Local Development

### Prerequisites
- Node.js (v22+)
- Bun or npm
- PostgreSQL database (local or Neon)

### Setup

1. **Install dependencies:**
   ```bash
   cd expo
   npm install
   ```

2. **Configure environment:**
   Create `.env` in the `expo/backend` directory based on the server infrastructure docs.

3. **Start the backend:**
   ```bash
   npx tsx backend/hono.ts
   ```

4. **Start the mobile app:**
   ```bash
   npx expo start
   ```

## Deployment

### Backend Deployment
The backend runs as a Windows Service (`QarajAPI`) managed by NSSM on the production server. Use the provided `deploy-backend.bat` script at the repo root for one-click deployment.

### Mobile App Build (EAS)
The app is built using Expo Application Services (EAS).

**Build Preview APK (for direct install):**
```bash
eas build --platform android --profile preview
```

**Build Production AAB (for Play Store):**
```bash
eas build --platform android --profile production
```

*Note: The `preview-v2` profile has been removed. All builds now use the V2 design by default.*

## Key Features

- **Authentication**: Phone number + SMS OTP + PIN (with biometric support)
- **Vehicle Management**: Register vehicles, sync from CRM/DWH, or submit "Find My Vehicle" requests
- **Appointments**: Book service appointments with pending approval flow
- **Service History**: View past service records
- **AI Advisory**: OpenAI-powered spare parts search
- **Push Notifications**: FCM integration via Expo Push Service
- **Multi-language**: Azerbaijani (default), English, Russian

## Versioning

The project uses semantic versioning (`MAJOR.MINOR.PATCH`) with sequential Android `versionCode`. See `CHANGELOG.md` at the repo root for the full version history.
