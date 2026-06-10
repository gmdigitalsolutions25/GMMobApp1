# Qaraj GM — Server Infrastructure & Path Reference

**Version:** 2.0
**Last updated:** June 10, 2026
**Server:** Windows Server 2019 (10.0.17763) at `91.107.161.67`

---

## 1. Directory Map

The entire Qaraj GM server deployment lives under `C:\QarajGM\`. Below is the authoritative layout with the purpose of each directory and key file.

```
C:\QarajGM\
│
├── Backend\                    ← NSSM service working directory (QarajAPI runs from here)
│   ├── .env                    ← Active environment config (SMS, DB, API keys)
│   ├── service-wrapper.js      ← NSSM entry point → runs `npx tsx backend/hono.ts`
│   ├── package.json            ← Node.js dependencies
│   ├── stdout.log              ← NSSM stdout capture
│   ├── stderr.log              ← NSSM stderr capture (check here for crashes)
│   │
│   ├── backend\                ← Backend source code (copied from repo)
│   │   ├── hono.ts             ← Main server file (Hono framework + all routes)
│   │   └── trpc\
│   │       ├── app-router.ts   ← tRPC router definition
│   │       └── routes\         ← All API route handlers
│   │
│   ├── car-images\             ← Static car images served at /static/cars/*
│   ├── service-center-images\  ← Static service center photos served at /static/service-centers/*
│   │
│   ├── db\                     ← Database layer
│   │   ├── index.ts            ← DB connection (PostgreSQL via Drizzle)
│   │   └── schema.ts           ← Table definitions
│   │
│   └── node_modules\           ← Installed packages (npm)
│
├── repo\                       ← Git repository clone (source of truth)
│   ├── CHANGELOG.md
│   ├── docs\                   ← Project documentation
│   └── expo\                   ← Full Expo/React Native project
│
└── nssm\                       ← NSSM (Non-Sucking Service Manager)
    └── nssm-2.24\
        └── win64\              ← 64-bit binary ← USE THIS ONE
            └── nssm.exe
```

---

## 2. NSSM Service Configuration

The backend API runs as a Windows Service called **QarajAPI**, managed by NSSM.

| Setting | Value |
|---------|-------|
| Service name | `QarajAPI` |
| NSSM path | `C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe` |
| AppDirectory | `C:\QarajGM\Backend` |
| Entry point | `service-wrapper.js` → `npx tsx backend/hono.ts` |
| Port | `3000` (configurable via `PORT` in `.env`) |
| Stdout log | `C:\QarajGM\Backend\stdout.log` |
| Stderr log | `C:\QarajGM\Backend\stderr.log` |

**Common NSSM commands** (run from `cmd` as Administrator):

```cmd
:: Check service status
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe status QarajAPI

:: Restart the service (after code updates)
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI

:: Stop the service
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe stop QarajAPI

:: Start the service
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```

---

## 3. Environment Variables (.env)

Located at `C:\QarajGM\Backend\.env`. Required variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://qaraj_app:qaraj_pass@ep-restless-water-123456.eu-central-1.aws.neon.tech/qaraj` |
| `NODE_ENV` | Environment mode | `production` |
| `QARAJ_API_KEY` | API key for tRPC endpoints | `qaraj-dev-key-2026` |
| `SMS_PROVIDER` | SMS gateway (`softline` or `mock`) | `softline` |
| `SMS_USER` | Softline API username | `diamondapi` |
| `SMS_PASSWORD` | Softline API password | `u6s0Wo52` |
| `SMS_SENDER` | SMS sender name | `Groupmotors` |
| `MONITORING_ALLOWED_IPS` | IPs allowed for monitoring endpoints | `127.0.0.1,::1,::ffff:127.0.0.1` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |

---

## 4. API Endpoints

**Base URL:** `http://91.107.161.67:3000`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/trpc/auth.*` | POST | API Key | `sendOtp`, `verifyOtp`, `setPin`, `verifyPin`, `changePin`, `resetPin`, `refreshToken` |
| `/api/trpc/users.*` | POST/GET | API Key | `upsert`, `getByPhone`, `getFullProfile`, `updateOnboarding` |
| `/api/trpc/vehicles.*` | POST/GET | API Key | `create`, `delete`, `getByPhone` |
| `/api/trpc/vehicleRequests.create` | POST | API Key | Submit "Find My Vehicle" request |
| `/api/trpc/dwh.syncVehicles` | POST | API Key | Sync vehicles from CRM/DWH |
| `/api/trpc/appointments.*` | POST/GET | API Key | `create`, `getByUser`, `updateStatus` |
| `/api/trpc/brandsModels.*` | GET | API Key | `list`, `modelsByBrand` |
| `/api/trpc/serviceCenters.list` | GET | API Key | Get service centers |
| `/api/trpc/pushTokens.*` | POST | API Key | `register`, `send`, `delete` |
| `/api/trpc/ai.spareParts` | POST | API Key | AI spare parts lookup |
| `/api/trpc/monitoring.*` | GET/POST | API Key | `errors`, `bugs`, `health` |
| `/static/cars/{brand}/{model}.webp` | GET | None | Static car images |
| `/static/service-centers/{name}.webp` | GET | None | Static service center images |

**API Key header:** `x-api-key: qaraj-dev-key-2026`

---

## 5. Deployment Procedures

### 5.1 Standard Deployment (Code & DB)

Use the provided batch script for one-click deployment:

```cmd
C:\QarajGM\repo\deploy-backend.bat
```

Or manually:
```cmd
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\
xcopy /E /Y expo\db\* C:\QarajGM\Backend\db\
cd C:\QarajGM\Backend
npm install --production
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

### 5.2 Update Car Images (no restart needed)

```cmd
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\assets\car-images C:\QarajGM\Backend\car-images\
```

### 5.3 Check Server Logs

```cmd
:: View recent errors
type C:\QarajGM\Backend\stderr.log

:: View recent output
type C:\QarajGM\Backend\stdout.log

:: Tail the log (PowerShell)
Get-Content C:\QarajGM\Backend\stderr.log -Tail 50 -Wait
```

---

## 6. External Services

| Service | Provider | Purpose | Credentials Location |
|---------|----------|---------|---------------------|
| SMS Gateway | Softline | OTP delivery | `.env` (SMS_USER, SMS_PASSWORD) |
| Database | PostgreSQL (Neon) | App data, DWH staging | `.env` (DATABASE_URL) |
| Push Notifications | Expo Push + FCM | Android push delivery | `google-services.json` in app |
| AI Advisory | OpenAI | Spare parts search | `.env` (OPENAI_API_KEY) |
| Mobile Builds | EAS (Expo) | APK/AAB generation | `EXPO_TOKEN` env var |

---

## 7. Critical Rules

1. **Service name is `QarajAPI`** — NOT QarajBackend, NOT qaraj, NOT Qaraj.
2. **NEVER** delete `stderr.log` while service is running — NSSM locks the file handle.
3. **ALWAYS** stop service before deleting logs.
4. **ALWAYS** `git pull` before `xcopy` — the repo may be stale.
5. **ALWAYS** verify deployed files with `findstr` after `xcopy` and before restarting.
6. **ALWAYS** run .bat files as Administrator (NSSM requires elevated privileges).
7. **DB migrations** must be run manually in Neon SQL Editor BEFORE restarting the service.
