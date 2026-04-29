# Qaraj GM — Server Infrastructure & Path Reference

**Version:** 1.1
**Last updated:** April 29, 2026
**Server:** Windows Server 2019 (10.0.17763) at `91.107.161.67`

---

## 1. Directory Map

The entire Qaraj GM server deployment lives under `C:\QarajGM\`. Below is the authoritative layout with the purpose of each directory and key file.

```
C:\QarajGM\
│
├── Backend\                    ← NSSM service working directory (QarajAPI runs from here)
│   ├── .env                    ← Active environment config (SMS, DB, API keys)
│   ├── .env.example            ← Template for .env
│   ├── 1.env / 2.env           ← Backup/test env files (can be cleaned up)
│   ├── service-wrapper.js      ← NSSM entry point → runs `npx tsx backend/hono.ts`
│   ├── package.json            ← Node.js dependencies
│   ├── package-lock.json       ← Lockfile
│   ├── tsconfig.json           ← TypeScript config
│   ├── stdout.log              ← NSSM stdout capture
│   ├── stderr.log              ← NSSM stderr capture (check here for crashes)
│   ├── stderr_copy.log         ← Backup of stderr
│   ├── iptest.js               ← Utility script (can be cleaned up)
│   ├── node-v22.13.0-x64.msi  ← Node.js installer (can be cleaned up)
│   ├── Uninstall.exe           ← Node.js uninstaller (can be cleaned up)
│   ├── bun.lock                ← Leftover from Bun experiment (can be cleaned up)
│   │
│   ├── backend\                ← Backend source code (copied from repo)
│   │   ├── hono.ts             ← Main server file (Hono framework + all routes)
│   │   ├── honoold.ts          ← Old backup of hono.ts (can be cleaned up)
│   │   ├── store.ts            ← In-memory data store
│   │   ├── Dockerfile          ← Docker config (not used in production)
│   │   ├── middleware\
│   │   │   ├── security.ts     ← API key auth, rate limiter, CORS
│   │   │   └── error-logger.ts ← Error logging middleware
│   │   ├── migrations\
│   │   │   └── 004_brands_models.sql
│   │   └── trpc\
│   │       ├── app-router.ts   ← tRPC router definition
│   │       ├── create-context.ts
│   │       └── routes\         ← All API route handlers
│   │           ├── ai/spare-parts/
│   │           ├── appointments/ (create, get-by-user, update-status)
│   │           ├── auth/ (send-otp, verify-otp, set-pin, verify-pin, change-pin, refresh-token, reset-pin)
│   │           ├── brands-models/
│   │           ├── monitoring/ (bug-reports, errors, system-health)
│   │           ├── push-tokens/ (register, send)
│   │           ├── service-centers/ (list)
│   │           ├── users/ (get-by-phone, get-full-profile, upsert)
│   │           └── vehicles/ (create, delete, get-by-phone)
│   │
│   ├── car-images\             ← Static car images served at /static/cars/*
│   │   ├── byd\       (17 images)
│   │   ├── ford\      (25 images)
│   │   ├── honda\     (15 images)
│   │   ├── mazda\     (18 images)
│   │   ├── mitsubishi\ (16 images)
│   │   ├── subaru\    (12 images)
│   │   └── toyota\    (28 images)
│   │                   Total: 131 images, ~10 MB
│   │
│   ├── service-center-images\  ← Static service center photos served at /static/service-centers/*
│   │   ├── toyota-absheron.webp
│   │   ├── mitsubishi-motors.webp
│   │   ├── mazda-azerbaijan.webp
│   │   ├── byd-absheron.webp
│   │   └── toyota-ganja.webp
│   │                   Total: 5 images, ~500 KB
│   │
│   ├── db\                     ← Database layer
│   │   ├── index.ts            ← DB connection (PostgreSQL via Drizzle)
│   │   ├── schema.ts           ← Table definitions
│   │   ├── migrate.ts          ← Migration runner
│   │   ├── seed.ts             ← Seed data
│   │   ├── migrations\
│   │   │   └── 003_monitoring_tables.sql
│   │   └── seeds\
│   │       └── seed-monitoring-data.sql
│   │
│   ├── types\                  ← Shared TypeScript types
│   └── node_modules\           ← Installed packages (npm)
│
├── repo\                       ← Git repository clone (source of truth)
│   ├── .gitignore
│   ├── CHANGELOG.md
│   ├── rork.json
│   ├── .github\
│   │   └── workflows\
│   │       ├── build-android-aab.yml
│   │       └── build-android-apk.yml
│   ├── docs\                   ← Project documentation
│   │   ├── 01-Business-Requirements.md
│   │   ├── 02-Technical-Architecture.md
│   │   ├── 03-API-Reference.md
│   │   ├── 04-Service-Desk-Dashboard.md
│   │   ├── 05-Server-Infrastructure.md  ← This document
│   │   ├── DEPLOY-Car-Images.md
│   │   ├── DEPLOY-Monitoring-Subsystem.md
│   │   └── firebase-push-notifications-setup.md
│   └── expo\                   ← Full Expo/React Native project
│       ├── app.json            ← Expo config (version, package name, etc.)
│       ├── eas.json            ← EAS Build profiles
│       ├── google-services.json ← Firebase config (FCM)
│       ├── package.json
│       ├── app\                ← Screen components
│       ├── assets\             ← Images, icons, car-images (source)
│       ├── backend\            ← Backend source (canonical copy)
│       ├── components\
│       ├── constants\          ← App config, i18n, mock data, car images map
│       ├── db\                 ← Database layer source
│       ├── hooks\
│       ├── lib\                ← Auth store, biometric, notifications, tRPC client
│       ├── providers\
│       ├── scripts\
│       └── types\
│
├── nssm\                       ← NSSM (Non-Sucking Service Manager)
│   └── nssm-2.24\
│       ├── win32\              ← 32-bit binary
│       └── win64\              ← 64-bit binary ← USE THIS ONE
│           └── nssm.exe
│
├── middleware\                  ← STALE — leftover from early deployment (safe to delete)
├── migrations\                 ← STALE — leftover from early deployment (safe to delete)
├── trpc\                       ← STALE — old copy of tRPC routes (safe to delete)
├── Dockerfile                  ← STALE — leftover (safe to delete)
├── hono.ts                     ← STALE — old hono.ts copy (safe to delete)
├── store.ts                    ← STALE — old store.ts copy (safe to delete)
├── nssm.zip                    ← STALE — original nssm archive (safe to delete)
├── qaraj-monitoring-deploy.zip ← STALE — old deployment package (safe to delete)
└── Local Disk (C) - Shortcut.lnk ← Desktop shortcut (can be removed)
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

:: View service configuration
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe get QarajAPI AppDirectory
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe get QarajAPI Application

:: Edit service configuration (opens GUI)
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe edit QarajAPI
```

---

## 3. Environment Variables (.env)

Located at `C:\QarajGM\Backend\.env`. Required variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://qaraj_app:qaraj_pass@localhost:5432/qaraj` |
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
| `/api/trpc/auth.sendOtp` | POST | API Key | Send OTP via SMS |
| `/api/trpc/auth.verifyOtp` | POST | API Key | Verify OTP code |
| `/api/trpc/auth.setPin` | POST | API Key | Set user PIN |
| `/api/trpc/auth.verifyPin` | POST | API Key | Verify user PIN |
| `/api/trpc/auth.changePin` | POST | API Key | Change user PIN |
| `/api/trpc/auth.resetPin` | POST | API Key | Reset user PIN |
| `/api/trpc/auth.refreshToken` | POST | API Key | Refresh JWT token |
| `/api/trpc/users.upsert` | POST | API Key | Create/update user profile |
| `/api/trpc/users.getByPhone` | GET | API Key | Get user by phone |
| `/api/trpc/users.getFullProfile` | GET | API Key | Get full user profile |
| `/api/trpc/vehicles.create` | POST | API Key | Add vehicle |
| `/api/trpc/vehicles.delete` | POST | API Key | Delete vehicle |
| `/api/trpc/vehicles.getByPhone` | GET | API Key | Get user's vehicles |
| `/api/trpc/appointments.create` | POST | API Key | Book appointment |
| `/api/trpc/appointments.getByUser` | GET | API Key | Get user's appointments |
| `/api/trpc/appointments.updateStatus` | POST | API Key | Update appointment status |
| `/api/trpc/brandsModels.list` | GET | API Key | Get all brands and models |
| `/api/trpc/serviceCenters.list` | GET | API Key | Get service centers |
| `/api/trpc/pushTokens.register` | POST | API Key | Register push token |
| `/api/trpc/pushTokens.send` | POST | API Key | Send push notification |
| `/api/trpc/ai.spareParts` | POST | API Key | AI spare parts lookup |
| `/api/trpc/monitoring.systemHealth` | GET | API Key | System health dashboard |
| `/api/trpc/monitoring.errors` | GET | API Key | Error logs |
| `/api/trpc/monitoring.bugReports` | GET | API Key | Bug reports |
| `/static/cars/{brand}/{model}.webp` | GET | None | Static car images |

**API Key header:** `x-api-key: qaraj-dev-key-2026`

---

## 5. Deployment Procedures

### 5.1 Update Backend Code

```cmd
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

### 5.2 Update Car Images (no restart needed)

```cmd
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\assets\car-images C:\QarajGM\Backend\car-images\
```

### 5.3 Update Database Schema

```cmd
cd C:\QarajGM\Backend
xcopy /E /Y C:\QarajGM\repo\expo\db\* db\
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

### 5.4 Check Server Logs

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
| Database | PostgreSQL (local) | User data, vehicles, appointments | `.env` (DATABASE_URL) |
| Push Notifications | Expo Push + FCM | Android push notifications | Firebase service account (pending) |
| Mobile Builds | EAS (Expo) | APK/AAB builds | EXPO_TOKEN in CI/Manus |
| Git Repository | GitHub (private) | Source code | PAT in remote URL |
| Firebase | Google Cloud | FCM for push notifications | `google-services.json` in app |

| Service | Account / URL |
|---------|---------------|
| GitHub repo | `https://github.com/Elnur004GH/Qaraj-GM` (private) |
| EAS project | `elnurhasan/qaraj` (ID: `76b96668-e97c-4609-a448-d655ae30ec2d`) |
| Firebase project | `qaraj-gm-fb5e3` (App ID: `1:154231480927:android:28249efef61c09d8d771ea`) |
| Server IP | `91.107.161.67` |
| App package | `az.qaraj.app` |

---

## 7. Cleanup Recommendations

The following files and folders at `C:\QarajGM\` root are **stale leftovers** from early manual deployment. They are not used by the running service and can be safely deleted:

| Path | Reason |
|------|--------|
| `C:\QarajGM\hono.ts` | Old copy, not used by NSSM service |
| `C:\QarajGM\store.ts` | Old copy, not used |
| `C:\QarajGM\Dockerfile` | Old copy, not used |
| `C:\QarajGM\middleware\` | Old middleware folder, not used |
| `C:\QarajGM\migrations\` | Old migrations folder, not used |
| `C:\QarajGM\trpc\` | Old tRPC routes, not used |
| `C:\QarajGM\nssm.zip` | Already extracted to `nssm\` |
| `C:\QarajGM\qaraj-monitoring-deploy.zip` | Already deployed |
| `C:\QarajGM\Local Disk (C) - Shortcut.lnk` | Desktop shortcut |
| `C:\QarajGM\repo_old\` | Corrupted old repo clone (if exists) — delete immediately |
| `C:\QarajGM\Backend\1.env` / `2.env` | Test env files |
| `C:\QarajGM\Backend\honoold.ts` | Old backup |
| `C:\QarajGM\Backend\iptest.js` | Test script |
| `C:\QarajGM\Backend\node-v22.13.0-x64.msi` | Node installer |
| `C:\QarajGM\Backend\Uninstall.exe` | Node uninstaller |
| `C:\QarajGM\Backend\bun.lock` | Bun experiment leftover |

**To clean up** (optional, run as Administrator):

```cmd
del C:\QarajGM\hono.ts C:\QarajGM\store.ts C:\QarajGM\Dockerfile
del C:\QarajGM\nssm.zip C:\QarajGM\qaraj-monitoring-deploy.zip
del "C:\QarajGM\Local Disk (C) - Shortcut.lnk"
rmdir /S /Q C:\QarajGM\middleware C:\QarajGM\migrations C:\QarajGM\trpc
del C:\QarajGM\Backend\1.env C:\QarajGM\Backend\2.env
del C:\QarajGM\Backend\backend\honoold.ts C:\QarajGM\Backend\iptest.js
del C:\QarajGM\Backend\node-v22.13.0-x64.msi C:\QarajGM\Backend\Uninstall.exe
del C:\QarajGM\Backend\bun.lock
rmdir /S /Q C:\QarajGM\repo_old 2>nul
```

---

## 8. Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  QARAJ GM SERVER — QUICK REFERENCE                          │
├─────────────────────────────────────────────────────────────┤
│  Server IP:     91.107.161.67                               │
│  API Port:      3000                                        │
│  API Base:      http://91.107.161.67:3000/api/trpc/         │
│  Static Files:  http://91.107.161.67:3000/static/cars/      │
│                                                             │
│  PATHS:                                                     │
│  Git repo:      C:\QarajGM\repo\                            │
│  Backend code:  C:\QarajGM\Backend\backend\                 │
│  Car images:    C:\QarajGM\Backend\car-images\              │
│  Environment:   C:\QarajGM\Backend\.env                     │
│  DB layer:      C:\QarajGM\Backend\db\                      │
│  Logs:          C:\QarajGM\Backend\stderr.log               │
│  NSSM:          C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe   │
│                                                             │
│  COMMANDS:                                                  │
│  Restart API:   nssm restart QarajAPI                       │
│  Pull code:     cd C:\QarajGM\repo && git pull origin main  │
│  Deploy code:   xcopy /E /Y expo\backend\* ..\Backend\backend\ │
│  Deploy images: xcopy /E /Y expo\assets\car-images ..\Backend\car-images\ │
└─────────────────────────────────────────────────────────────┘
```
