# Qaraj GM — Backend Deployment Guide

**Version:** 2.0
**Date:** April 29, 2026
**Status:** Active

---

## Server Information

| Item | Value |
|------|-------|
| Server IP | `91.107.161.67` |
| OS | Windows Server |
| API Port | 3000 |
| Backend Path | `C:\QarajGM\Backend\` |
| Git Repo Path | `C:\QarajGM\repo\` |
| Service Manager | NSSM (`C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe`) |
| Service Name | `QarajAPI` |
| Database | PostgreSQL on Neon (cloud) |
| SMS Provider | Softline (sender: "Groupmotors") |

---

## Standard Backend Update Procedure

When backend code changes are pushed to the `main` branch, run these commands on the server:

```bash
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

Verify the server is running:

```bash
curl http://localhost:3000/
```

Expected response:
```json
{"status":"ok","message":"Qaraj GM Backend API v1.0.4","monitoring":"/monitoring — Bug reports, error & system health dashboard"}
```

---

## Car Images Deployment

Car model images must be deployed to the server for the static file server to serve them.

**First-time setup:**

```bash
cd C:\QarajGM\repo
git pull origin main
xcopy /E /Y /I expo\assets\car-images\* C:\QarajGM\Backend\car-images\
```

**Verify images are accessible:**

```bash
curl http://localhost:3000/static/cars/toyota/camry.webp -o NUL -w "%{http_code}"
```

Expected: `200`

**Image directory structure:**
```
C:\QarajGM\Backend\car-images\
├── byd\        (14 models)
├── ford\       (21 models)
├── honda\      (12 models)
├── mazda\      (15 models)
├── mitsubishi\ (13 models)
├── subaru\     (10 models)
└── toyota\     (24 models)
```

**Total:** 109 images, ~8.5 MB, 800px wide WebP format.

**To update a single image:** Replace the `.webp` file in the appropriate brand folder. No server restart needed — changes are immediate.

---

## Environment Variables

The backend `.env` file is located at `C:\QarajGM\Backend\.env`. Key variables:

| Variable | Description | Current Value |
|----------|-------------|---------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | (configured) |
| `JWT_SECRET` | Secret for signing JWT tokens | (configured) |
| `API_KEY` | API key for mobile app authentication | `qaraj-dev-key-2026` |
| `SMS_USER` | Softline SMS gateway username | (configured) |
| `SMS_PASSWORD` | Softline SMS gateway password | (configured) |
| `SMS_SENDER` | SMS sender name | `Groupmotors` |
| `SMS_MOCK` | Set to `true` to log OTPs instead of sending SMS | `false` |
| `OPENAI_API_KEY` | OpenAI API key for spare parts advisor | (configured) |

---

## Monitoring Dashboard

The monitoring dashboard is accessible at:

```
http://91.107.161.67:3000/monitoring
```

**Access restriction:** Only accessible from the server's own IP (localhost) and whitelisted admin IPs.

**Features:**
- Error log viewer with severity filtering
- Bug report management with status tracking
- System health metrics (DB stats, user counts, API performance)

---

## Rollback Procedure

To roll back to a previous version:

```bash
cd C:\QarajGM\repo
git fetch --all
git checkout v1.1.0          # or any tagged version
xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
```

---

## Troubleshooting

**Server won't start:**
```bash
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe status QarajAPI
```

**Database connection issues:** Verify `DATABASE_URL` in `.env`. Neon databases may pause after inactivity — first request after pause takes 2–3 seconds.

**SMS not sending:**
1. Check `SMS_MOCK` is `false` in `.env`
2. Verify `SMS_SENDER` is `Groupmotors`
3. Check SMS balance via Softline portal

**Car images not loading:**
1. Verify images deployed: `dir C:\QarajGM\Backend\car-images\toyota\`
2. Test: `curl http://localhost:3000/static/cars/toyota/camry.webp -o NUL -w "%{http_code}"`
3. If 404, re-deploy using the car images deployment commands above

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 25, 2026 | Initial monitoring subsystem deployment guide |
| 1.1 | April 25, 2026 | Added troubleshooting and rollback sections |
| 2.0 | April 29, 2026 | Expanded to full backend deployment guide; added car images, environment variables, standard update procedure |

---

*This document is maintained in the Qaraj GM project repository.*
