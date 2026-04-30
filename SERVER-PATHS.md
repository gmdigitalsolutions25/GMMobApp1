# Qaraj GM — Server Paths & Service Reference

> **MANDATORY READ** before creating any deployment script, .bat file, or running any server command.
> This is the single source of truth for all paths, service names, and deployment commands.

---

## Windows Server

| Item | Value |
|------|-------|
| **Server IP** | `91.107.161.67` |
| **OS** | Windows Server 2019 (10.0.17763) |
| **API Port** | `3000` |
| **API Base URL** | `http://91.107.161.67:3000/api/trpc/` |
| **Static files URL** | `http://91.107.161.67:3000/static/cars/` |

---

## Critical Paths on Server

| Item | Absolute Path |
|------|---------------|
| **Root directory** | `C:\QarajGM\` |
| **Git repo** | `C:\QarajGM\repo\` |
| **Backend service dir** | `C:\QarajGM\Backend\` |
| **Backend source code** | `C:\QarajGM\Backend\backend\` |
| **Backend entry point** | `C:\QarajGM\Backend\service-wrapper.js` |
| **Backend .env** | `C:\QarajGM\Backend\.env` |
| **DB layer (deployed)** | `C:\QarajGM\Backend\db\` |
| **Car images (deployed)** | `C:\QarajGM\Backend\car-images\` |
| **Service center images** | `C:\QarajGM\Backend\service-center-images\` |
| **Stdout log** | `C:\QarajGM\Backend\stdout.log` |
| **Stderr log** | `C:\QarajGM\Backend\stderr.log` |
| **NSSM executable** | `C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe` |
| **Migrations (in repo)** | `C:\QarajGM\repo\expo\backend\migrations\` |

---

## NSSM Service

| Setting | Value |
|---------|-------|
| **Service name** | `QarajAPI` |
| **NSSM path** | `C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe` |
| **AppDirectory** | `C:\QarajGM\Backend` |
| **Entry point** | `service-wrapper.js` → `npx tsx backend/hono.ts` |
| **Port** | `3000` (from `.env`) |

---

## Standard Deployment Commands

```cmd
:: 1. Pull latest code
cd /d C:\QarajGM\repo
git pull origin main

:: 2. Copy backend source to service directory
xcopy /E /Y C:\QarajGM\repo\expo\backend\* C:\QarajGM\Backend\backend\

:: 3. Copy DB layer to service directory
xcopy /E /Y C:\QarajGM\repo\expo\db\* C:\QarajGM\Backend\db\

:: 4. Install dependencies (if new packages added)
cd /d C:\QarajGM\Backend
npm install --production

:: 5. Restart service
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI

:: 6. Verify
curl http://localhost:3000/
```

---

## NSSM Commands (run as Administrator)

```cmd
:: Status
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe status QarajAPI

:: Restart
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI

:: Stop
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe stop QarajAPI

:: Start
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI

:: View config
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe get QarajAPI AppDirectory
```

---

## Car Images Deployment (no restart needed)

```cmd
cd /d C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\assets\car-images\* C:\QarajGM\Backend\car-images\
```

---

## EAS Build (Mobile App)

| Item | Value |
|------|-------|
| **EAS Account** | `elnurhasan` / `elnur004@gmail.com` |
| **Project slug** | `qaraj` |
| **Project ID** | `76b96668-e97c-4609-a448-d655ae30ec2d` |
| **Android package** | `az.qaraj.app` |
| **Build profile (APK)** | `preview` |
| **Build profile (AAB)** | `production` |
| **APK naming convention** | `QarajGM-vX.Y.Z.apk` |
| **Firebase project** | `qaraj-gm-fb5e3` |
| **Firebase App ID** | `1:154231480927:android:28249efef61c09d8d771ea` |

---

## Database

| Item | Value |
|------|-------|
| **Provider** | PostgreSQL on Neon (cloud) |
| **Connection string** | In `C:\QarajGM\Backend\.env` (`DATABASE_URL`) |
| **Migrations** | Run manually via pgAdmin or psql |
| **Schema file** | `C:\QarajGM\Backend\db\schema.ts` |

---

## External Services

| Service | Provider | Credentials |
|---------|----------|-------------|
| SMS Gateway | Softline (sender: "Groupmotors") | `.env` → `SMS_USER`, `SMS_PASSWORD` |
| Push Notifications | Expo Push + FCM | `google-services.json` in app |
| Git Repository | GitHub (private) | PAT in remote URL |
| Mobile Builds | EAS (Expo) | `EXPO_TOKEN` env var |

---

## GitHub

| Item | Value |
|------|-------|
| **Repo URL** | `https://github.com/Elnur004GH/Qaraj-GM` (private) |
| **Main branch** | `main` |
| **CI workflows** | `.github/workflows/build-android-apk.yml`, `build-android-aab.yml` |

---

## API Key

| Header | Value |
|--------|-------|
| `x-api-key` | `qaraj-dev-key-2026` |

---

## Critical Rules

1. **Service name is `QarajAPI`** — NOT QarajBackend, NOT qaraj, NOT Qaraj.
2. **NEVER** delete `stderr.log` while service is running — NSSM locks the file handle.
3. **ALWAYS** stop service before deleting logs.
4. **ALWAYS** `git pull` before `xcopy` — the repo may be stale.
5. **ALWAYS** verify deployed files with `findstr` after `xcopy` and before restarting.
6. **ALWAYS** run .bat files as Administrator (NSSM requires elevated privileges).
7. **DB migrations** must be run manually in pgAdmin BEFORE restarting the service.

---

*Last updated: April 30, 2026 — v1.2.5 (versionCode 35)*
