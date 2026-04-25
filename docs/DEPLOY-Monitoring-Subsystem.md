# Qaraj GM — Monitoring Subsystem Deployment Guide

**Version:** 1.1
**Date:** April 25, 2026
**Time required:** 15–20 minutes
**Difficulty:** Easy — copy-paste commands only, no coding required

---

## What This Deployment Does

This deployment adds a monitoring system to the Qaraj GM backend server. After completing these steps, the server will be able to:

- Track and store error logs (API errors, mobile app crashes, SMS failures)
- Accept and manage bug reports from testers and users
- Monitor system health (database status, API response times, user counts)
- Provide 12 new API endpoints for the monitoring dashboard

Nothing existing will break. This only adds new features.

---

## What You Need Before Starting

1. **Physical or remote access** to the Qaraj GM server (Windows machine at IP `91.107.161.67`)
2. **The deployment zip file:** `qaraj-monitoring-deploy.zip` (attached to this document or available from the project lead)
3. **pgAdmin** installed on the server (it should already be there — look for it in the Start menu)
4. **The database password** for the `qaraj_app` user (ask the project lead if you do not have it)

---

## Step 1: Extract the Zip File

1. Find the file `qaraj-monitoring-deploy.zip` (it may be in your Downloads folder or wherever you saved it)
2. Right-click the zip file
3. Click **"Extract All..."**
4. Change the destination to `C:\Temp\qaraj-monitoring-deploy`
5. Click **"Extract"**

After extraction, you should see these files inside `C:\Temp\qaraj-monitoring-deploy\`:

```
qaraj-monitoring-deploy\
  ├── 003_monitoring_tables.sql          ← Creates new database tables
  ├── seed-monitoring-data.sql           ← Fills tables with test data
  ├── schema.ts                          ← Updated database schema file
  └── backend\
      └── trpc\
          ├── app-router.ts              ← Updated API router
          └── routes\
              └── monitoring\
                  ├── errors\
                  │   └── route.ts       ← Error tracking API
                  ├── bug-reports\
                  │   └── route.ts       ← Bug reports API
                  └── system-health\
                      └── route.ts       ← Health check API
```

---

## Step 2: Create the Database Tables

This step creates 3 new tables in the database. It does NOT touch any existing tables.

1. Open **pgAdmin** from the Start menu (search for "pgAdmin" if you cannot find it)
2. In the left panel, expand **Servers**
3. Click on the server name — it will ask for a password. Enter the database password.
4. Expand **Databases**
5. Right-click on the **qaraj** database
6. Click **"Query Tool"** — a new tab will open with a blank text area

Now run the migration:

7. In the Query Tool, click the **folder icon** (Open File) in the toolbar
8. Navigate to `C:\Temp\qaraj-monitoring-deploy\`
9. Select the file `003_monitoring_tables.sql`
10. Click **Open**
11. The SQL code will appear in the text area
12. Click the **play button** (▶) in the toolbar to execute

**What you should see:** A results table at the bottom listing all database tables. Look for these 3 new ones in the list:

- `error_logs`
- `bug_reports`
- `system_health_snapshots`

If you see them, the migration succeeded. Move to the next step.

**If you see an error:** Take a screenshot and send it to the project lead.

---

## Step 3: Load the Test Data

This step fills the new tables with realistic test data so the dashboard has something to show.

1. You should still be in pgAdmin Query Tool from the previous step
2. Click the **folder icon** (Open File) again
3. Navigate to `C:\Temp\qaraj-monitoring-deploy\`
4. Select the file `seed-monitoring-data.sql`
5. Click **Open**
6. Click the **play button** (▶) to execute

**What you should see:** A results table at the bottom showing:

| table_name | row_count |
|---|---|
| error_logs | 25 |
| bug_reports | 13 |
| system_health_snapshots | 48 |

If you see these numbers, the test data was loaded successfully.

You can now close pgAdmin.

---

## Step 4: Stop the Running Service

The API service must be stopped before we can replace files.

1. Click the **Start menu**
2. Type `PowerShell`
3. Right-click on **"Windows PowerShell"**
4. Click **"Run as administrator"**
5. If a popup asks "Do you want to allow this app to make changes?" click **Yes**

In the blue PowerShell window, type this command and press Enter:

```
taskkill /F /IM node.exe
```

**What you should see:** One or more lines saying:

```
SUCCESS: The process "node.exe" with PID XXXXX has been terminated.
```

If it says "not found" — that is OK, it means the service was already stopped.

---

## Step 5: Create New Folders

In the same PowerShell window, type these 3 commands one at a time, pressing Enter after each:

```
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\errors
```

```
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\bug-reports
```

```
mkdir C:\QarajGM\Backend\backend\trpc\routes\monitoring\system-health
```

If any command says "already exists" — that is fine, continue to the next one.

---

## Step 6: Copy the New Files

In the same PowerShell window, type these 5 commands one at a time. Press Enter after each. If asked "Overwrite?", type **Y** and press Enter.

**Command 1 — Error tracking API:**
```
copy "C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\errors\route.ts" "C:\QarajGM\Backend\backend\trpc\routes\monitoring\errors\route.ts"
```

**Command 2 — Bug reports API:**
```
copy "C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\bug-reports\route.ts" "C:\QarajGM\Backend\backend\trpc\routes\monitoring\bug-reports\route.ts"
```

**Command 3 — System health API:**
```
copy "C:\Temp\qaraj-monitoring-deploy\backend\trpc\routes\monitoring\system-health\route.ts" "C:\QarajGM\Backend\backend\trpc\routes\monitoring\system-health\route.ts"
```

**Command 4 — Updated API router (OVERWRITE):**
```
copy "C:\Temp\qaraj-monitoring-deploy\backend\trpc\app-router.ts" "C:\QarajGM\Backend\backend\trpc\app-router.ts"
```

**Command 5 — Updated database schema (OVERWRITE):**
```
copy "C:\Temp\qaraj-monitoring-deploy\schema.ts" "C:\QarajGM\Backend\db\schema.ts"
```

Each command should say `1 file(s) copied.` — if you see that for all 5, you are done with file copying.

---

## Step 7: Start the Service

In the same PowerShell window, type:

```
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```

**What you should see:** Either:
- `QarajBackend: START: The operation completed successfully.`
- `QarajBackend: START: An instance of the service is already running.`

Both are OK. The second one means the service auto-restarted itself.

Wait **10 seconds** for the service to fully start.

---

## Step 8: Verify Everything Works

Run these tests in the same PowerShell window:

**Test 1 — Is the API running?**

```
curl http://localhost:3000/
```

You should see:
```
{"status":"ok","message":"Qaraj GM Backend API v1.0.3"...}
```

If you see this, the API is running.

**Test 2 — Do the monitoring endpoints work?**

```
curl http://localhost:3000/api/trpc/monitoring.health.live -H "x-api-key: qaraj-dev-key-2026"
```

You should see a JSON response containing `"status":"healthy"`.

**Test 3 — Open the dashboard in a browser:**

Open Chrome or Edge on the server and go to:

```
http://localhost:3000/monitoring
```

You should see the **Qaraj GM Monitoring** dashboard with error counts and data.

---

## Verification Checklist

Go through this list and check each item:

| # | Check | How to verify | Expected result |
|---|-------|--------------|-----------------|
| 1 | Database tables created | pgAdmin → qaraj → Tables | See `error_logs`, `bug_reports`, `system_health_snapshots` |
| 2 | Test data loaded | pgAdmin → Query: `SELECT COUNT(*) FROM error_logs` | Returns 25 |
| 3 | API is running | `curl http://localhost:3000/` | Returns JSON with v1.0.3 |
| 4 | Health endpoint works | `curl http://localhost:3000/api/trpc/monitoring.health.live -H "x-api-key: qaraj-dev-key-2026"` | Returns JSON with "healthy" |
| 5 | Dashboard loads | Open `http://localhost:3000/monitoring` in browser | Shows monitoring page with data |

If all 5 checks pass, the deployment is complete. Send a confirmation to the project lead.

---

## Troubleshooting

**Problem: pgAdmin asks for a password and I do not have it.**
Solution: Contact the project lead (Elnur) for the database password.

**Problem: The SQL migration shows an error about "already exists".**
Solution: This means the tables were already created (perhaps from a previous attempt). This is safe to ignore. Continue to the next step.

**Problem: `taskkill` says "Access is denied".**
Solution: You are not running PowerShell as Administrator. Close the window and reopen it by right-clicking → "Run as administrator".

**Problem: `curl http://localhost:3000/` says "connection refused".**
Solution: The service did not start. Run:
```
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```
Wait 10 seconds and try again. If it still fails, check the error log:
```
type C:\QarajGM\Backend\qaraj-api.log
```
Take a screenshot of the last 20 lines and send to the project lead.

**Problem: The monitoring endpoint returns "404 Not Found".**
Solution: The `app-router.ts` file was not copied correctly. Go back to Step 6, Command 4 and redo it. Then restart the service (Step 7).

**Problem: The dashboard shows but with no data.**
Solution: The seed data SQL was not run. Go back to Step 3 and run it.

---

## Rollback (How to Undo)

If something goes wrong and you need to revert everything:

1. Stop the service:
```
taskkill /F /IM node.exe
```

2. In pgAdmin, run this SQL to remove the new tables:
```sql
DROP TABLE IF EXISTS system_health_snapshots;
DROP TABLE IF EXISTS bug_reports;
DROP TABLE IF EXISTS error_logs;
DROP TYPE IF EXISTS bug_report_status;
DROP TYPE IF EXISTS severity;
```

3. Restore the original files from Git backup. In PowerShell:
```
cd C:\QarajGM\Backend
git checkout HEAD~1 -- backend/trpc/app-router.ts
git checkout HEAD~1 -- db/schema.ts
```

4. Start the service:
```
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe start QarajAPI
```

The system will be back to its previous state.

---

## Contact

If you encounter any issue not covered in this guide:

- **Project Lead:** Elnur Hasanov
- **Technical Support:** Create a task in the Qaraj project on Manus

---

*Document version: 1.1 — April 25, 2026*
