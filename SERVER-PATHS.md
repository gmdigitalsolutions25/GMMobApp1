# Qaraj GM — Server Paths & Service Reference

> **READ THIS FIRST** before creating any deployment script, .bat file, or running any server command.

## Windows Server: 91.107.161.67

| Item | Path / Value |
|------|-------------|
| **Git repo** | `C:\QarajGM\repo` |
| **Backend service dir** | `C:\QarajGM\Backend` |
| **Backend entry point** | `C:\QarajGM\Backend\service-wrapper.js` → `npx tsx backend/hono.ts` |
| **Backend .env** | `C:\QarajGM\Backend\.env` |
| **Backend stdout log** | `C:\QarajGM\Backend\stdout.log` |
| **Backend stderr log** | `C:\QarajGM\Backend\stderr.log` |
| **NSSM executable** | `C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe` |
| **Service name** | `QarajAPI` |
| **Static images dir** | `C:\QarajGM\Backend\static\service-centers\` |
| **DB migrations dir** | `C:\QarajGM\repo\expo\backend\migrations\` |

## Standard Deployment Commands

```cmd
:: Pull latest code
cd /d C:\QarajGM\repo
git pull origin main

:: Copy backend to service directory
xcopy /E /Y C:\QarajGM\repo\expo\backend\* C:\QarajGM\Backend\backend\
xcopy /E /Y C:\QarajGM\repo\expo\db\* C:\QarajGM\Backend\db\

:: Install dependencies
cd /d C:\QarajGM\Backend
npm install --production

:: Restart service
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI

:: Check service status
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe status QarajAPI

:: View logs
type C:\QarajGM\Backend\stderr.log
```

## EAS Build

| Item | Value |
|------|-------|
| **EAS Account** | `elnurhasan` / `elnur004@gmail.com` |
| **Project slug** | `qaraj` |
| **Project ID** | `76b96668-e97c-4609-a448-d655ae30ec2d` |
| **Android package** | `az.qaraj.app` |
| **APK naming** | `QarajGM-vX.Y.Z.apk` |
| **Build profile** | `preview` (APK), `production` (AAB) |

## Database

| Item | Value |
|------|-------|
| **Provider** | PostgreSQL on Neon (cloud) |
| **Connection** | Configured in `C:\QarajGM\Backend\.env` |
| **Migrations** | Run manually via pgAdmin or psql |

---

*Last updated: April 30, 2026 — v1.2.5*
