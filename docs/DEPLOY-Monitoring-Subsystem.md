# Qaraj GM — Monitoring Subsystem Deployment Guide

**Version:** 1.0
**Date:** April 25, 2026
**Author:** Manus (CTO/Architect)
**Target:** Production server at `91.107.161.67`

---

## Overview

This guide deploys the monitoring subsystem for Qaraj GM, which adds:

- **Error Logs** — tracks API errors, mobile crashes, auth failures, SMS issues
- **Bug Reports** — lifecycle tracking for user/tester-reported bugs
- **System Health** — real-time health checks and historical metrics
- **12 new API endpoints** under `monitoring.*`
- **Seed data** — 25 error logs, 13 bug reports, 48 health snapshots

**Estimated time:** 15 minutes
**Risk level:** Low — adds new tables and routes, does not modify existing ones
**Rollback:** Drop the 3 new tables and revert `app-router.ts` and `schema.ts`

---

## Prerequisites

- Admin access to the Windows server (`91.107.161.67`)
- Access to PostgreSQL database (via `psql` or pgAdmin on the server)
- The deployment zip: `qaraj-monitoring-deploy.zip`
- Admin PowerShell terminal

---

## Step 1: Download the Deployment Package

Download `qaraj-monitoring-deploy.zip` and extract it to `C:\Temp\qaraj-monitoring-deploy\`.

You can also extract to any temporary location — adjust paths below accordingly.

---

## Step 2: Run the Database Migration

This creates the 3 new tables and their indexes. Connect to PostgreSQL and run the migration SQL.

**Option A — Using psql from command line:**

```powershell
psql -U qaraj_app -d qaraj -f C:\Temp\qaraj-monitoring-deploy\003_monitoring_tables.sql
```

When prompted, enter the database password.

**Option B — Using pgAdmin:**

1. Open pgAdmin and connect to the `qaraj` database
2. Open the Query Tool (Tools → Query Tool)
3. Open the file `C:\Temp\qaraj-monitoring-deploy\003_monitoring_tables.sql`
4. Click the Execute/Run button (play icon)
5. Verify the output shows a list of all tables including `error_logs`, `bug_reports`, and `system_health_snapshots`

**Expected output (table list):**

```
appointments
bug_reports
error_logs
otp_codes
push_tokens
service_centers
service_records
system_health_snapshots
users
vehicle_photos
vehicles
```

If you see all 11 tables, the migration succeeded.

---

## Step 3: Run the Seed Data

This populates the monitoring tables with realistic test data.

**Option A — Using psql:**

```powershell
psql -U qaraj_app -d qaraj -f C:\Temp\qaraj-monitoring-deploy\seed-monitoring-data.sql
```

**Option B — Using pgAdmin:**

1. In pgAdmin Query Tool, open `C:\Temp\qaraj-monitoring-deploy\seed-monitoring-data.sql`
2. Execute it
3. Verify the output shows row counts:

```
table_name                  | row_count
----------------------------+----------
error_logs                  | 25
bug_reports                 | 13
system_health_snapshots     | 48
```

---

## Step 4: Stop the API Service

Open **Admin PowerShell** (right-click PowerShell → Run as Administrator):

```powershell
taskkill /F /IM node.exe
```

Wait for "SUCCESS" messages confirming all node processes are terminated.

---

## Step 5: Create the Monitoring Routes Directory

```powershell
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\errors
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\bug-reports
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\system-health
```

If any directory already exists, the command will say so — that is fine, continue.

---

## Step 6: Copy the Backend Files

Run these commands one at a time:

```powershell
copy C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\errors\route.ts C:\QarajGM\Backend\backend\trpc\routes\monitoring\errors\route.ts
```

```powershell
copy C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\bug-reports\route.ts C:\QarajGM\Backend\backend\trpc\routes\monitoring\bug-reports\route.ts
```

```powershell
copy C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\system-health\route.ts C:\QarajGM\Backend\backend\trpc\routes\monitoring\system-health\route.ts
```

```powershell
copy C:\Temp\qaraj-monitoring-deploy\backend\trpc\app-router.ts C:\QarajGM\Backend\backend\trpc\app-router.ts
```

When prompted "Overwrite?" for `app-router.ts`, type **Y** and press Enter.

```powershell
copy C:\Temp\qaraj-monitoring-deploy\schema.ts C:\QarajGM\Backend\db\schema.ts
```

When prompted "Overwrite?" for `schema.ts`, type **Y** and press Enter.

**Total: 5 file copies (3 new files, 2 replacements)**

---

## Step 7: Start the API Service

```powershell
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```

If it says "An instance of the service is already running", that means NSSM auto-restarted it after the kill — that is fine.

Wait 5 seconds, then verify:

```powershell
curl http://localhost:3000/
```

Expected response:
```json
{"status":"ok","message":"Qaraj GM Backend API v1.0.3","monitoring":"/monitoring — Bug reports & error dashboard"}
```

---

## Step 8: Verify the Monitoring Endpoints

Run these tests to confirm everything works:

**Test 1 — Live health check:**

```powershell
curl http://localhost:3000/api/trpc/monitoring.health.live -H "x-api-key: qaraj-dev-key-2026"
```

Expected: JSON with `status: "healthy"`, database and SMS check results.

**Test 2 — Dashboard summary:**

```powershell
curl http://localhost:3000/api/trpc/monitoring.health.summary -H "x-api-key: qaraj-dev-key-2026"
```

Expected: JSON with user counts, vehicle counts, error stats, bug stats.

**Test 3 — Error list:**

```powershell
curl http://localhost:3000/api/trpc/monitoring.errors.list -H "x-api-key: qaraj-dev-key-2026"
```

Expected: JSON with 25 error log entries.

**Test 4 — Bug reports list:**

```powershell
curl http://localhost:3000/api/trpc/monitoring.bugs.list -H "x-api-key: qaraj-dev-key-2026"
```

Expected: JSON with 13 bug report entries.

---

## Step 9: Verify from the Monitoring Dashboard

Open in browser on the server: `http://localhost:3000/monitoring`

The dashboard should now show real data from the database instead of the in-memory store.

---

## Verification Checklist

| Check | Expected Result | Pass? |
|-------|----------------|-------|
| `curl http://localhost:3000/` | Returns v1.0.3 JSON | |
| `monitoring.health.live` | Returns healthy status | |
| `monitoring.health.summary` | Returns user/vehicle/error counts | |
| `monitoring.errors.list` | Returns 25 error entries | |
| `monitoring.bugs.list` | Returns 13 bug reports | |
| `monitoring.health.history` | Returns 48 health snapshots | |
| `/monitoring` dashboard | Shows data in browser | |

---

## Rollback Procedure

If anything goes wrong, revert in this order:

**1. Restore previous files:**

The only files that were replaced are `app-router.ts` and `schema.ts`. Restore them from Git:

```powershell
cd C:\QarajGM\Backend
git checkout HEAD~1 -- backend/trpc/app-router.ts
git checkout HEAD~1 -- db/schema.ts
```

**2. Drop the new tables (optional — only if they cause issues):**

```sql
DROP TABLE IF EXISTS system_health_snapshots;
DROP TABLE IF EXISTS bug_reports;
DROP TABLE IF EXISTS error_logs;
DROP TYPE IF EXISTS bug_report_status;
DROP TYPE IF EXISTS severity;
```

**3. Restart the service:**

```powershell
taskkill /F /IM node.exe
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```

---

## Seed Data Summary

The seed data includes realistic scenarios based on actual events:

**Error Logs (25 entries):**

| Severity | Count | Examples |
|----------|-------|---------|
| Critical | 2 | DB connection pool exhaustion, OTP memory leak |
| High | 5 | SMS errno=40, rate limit violations, FK constraint errors |
| Medium | 8 | Duplicate VIN, network timeouts, slow queries, biometric failures |
| Low | 10 | 404s, firewall blocks, deprecation warnings, font loading |

**Bug Reports (13 entries):**

| Status | Count | Examples |
|--------|-------|---------|
| New | 6 | OTP not received on Bakcell, timezone bug, push notification deep link |
| Acknowledged | 2 | Price formatting, Azerbaijani translations |
| In Progress | 2 | Missing vehicle, photo upload failure |
| Resolved | 1 | Android 14 crash (fixed in v1.0.3) |

**Health Snapshots (48 entries):**

48 hourly snapshots showing realistic patterns: overnight lulls, morning ramp-up, peak business hours, a service restart event, and a brief DB degradation period.

---

## New API Endpoints Reference

All endpoints require the `x-api-key: qaraj-dev-key-2026` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `monitoring.errors.list` | GET | List errors with filters |
| `monitoring.errors.stats` | GET | Error statistics summary |
| `monitoring.errors.resolve` | POST | Mark error as resolved |
| `monitoring.bugs.submit` | POST | Submit a new bug report |
| `monitoring.bugs.list` | GET | List bug reports with filters |
| `monitoring.bugs.updateStatus` | POST | Update bug report status |
| `monitoring.bugs.logClientError` | POST | Log mobile app errors |
| `monitoring.health.live` | GET | Real-time health check |
| `monitoring.health.summary` | GET | Full dashboard metrics |
| `monitoring.health.saveSnapshot` | POST | Save health snapshot |
| `monitoring.health.history` | GET | Historical health data |

---

*Document version: 1.0 — April 25, 2026*
