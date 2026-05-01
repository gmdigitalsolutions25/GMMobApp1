@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  Qaraj GM — Backend Deployment Script
REM  Run as Administrator on Windows Server (91.107.161.67)
REM
REM  What it does:
REM    1. Pulls latest code from GitHub
REM    2. Copies backend + db files to service directory
REM    3. Runs pending SQL migrations against Neon PostgreSQL
REM    4. Installs any new npm dependencies
REM    5. Restarts the QarajAPI service via NSSM
REM    6. Verifies the service is running
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

echo.
echo ══════════════════════════════════════════════════════
echo   QARAJ GM — Backend Deployment
echo   %date% %time%
echo ══════════════════════════════════════════════════════
echo.

REM ── Paths ──────────────────────────────────────────────────────────────────
set REPO=C:\QarajGM\repo
set BACKEND=C:\QarajGM\Backend
set NSSM=C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe
set SERVICE=QarajAPI
set MIGRATIONS=%REPO%\expo\backend\migrations
set MIGRATION_LOG=%BACKEND%\migration-log.txt

REM ── Step 1: Pull latest code ───────────────────────────────────────────────
echo [1/6] Pulling latest code from GitHub...
cd /d %REPO%
git pull origin main
if errorlevel 1 (
    echo ERROR: git pull failed!
    pause
    exit /b 1
)
echo      OK — Code updated.
echo.

REM ── Step 2: Copy backend + db files ────────────────────────────────────────
echo [2/6] Copying backend source files...
xcopy /E /Y "%REPO%\expo\backend\*" "%BACKEND%\backend\" >nul
xcopy /E /Y "%REPO%\expo\db\*" "%BACKEND%\db\" >nul
echo      OK — Files copied.
echo.

REM ── Step 3: Run SQL migrations ─────────────────────────────────────────────
echo [3/6] Checking for pending SQL migrations...

REM Read DATABASE_URL from .env file
for /f "tokens=1,* delims==" %%a in ('findstr /B "DATABASE_URL" "%BACKEND%\.env"') do (
    set DB_URL=%%b
)

if "!DB_URL!"=="" (
    echo WARNING: DATABASE_URL not found in .env — skipping migrations.
    echo          Run migrations manually in pgAdmin.
    goto :skip_migrations
)

REM Check if psql is available
where psql >nul 2>&1
if errorlevel 1 (
    echo WARNING: psql not found in PATH — skipping auto-migration.
    echo          Run these migrations manually in pgAdmin:
    echo.
    for %%f in ("%MIGRATIONS%\*.sql") do (
        echo          - %%~nxf
    )
    echo.
    goto :skip_migrations
)

REM Create migration tracking file if it doesn't exist
if not exist "%MIGRATION_LOG%" (
    echo. > "%MIGRATION_LOG%"
)

REM Run each migration that hasn't been run yet
set MIGRATION_COUNT=0
for %%f in ("%MIGRATIONS%\*.sql") do (
    findstr /C:"%%~nxf" "%MIGRATION_LOG%" >nul 2>&1
    if errorlevel 1 (
        echo      Running migration: %%~nxf
        psql "!DB_URL!" -f "%%f" 2>&1
        if errorlevel 1 (
            echo      ERROR: Migration %%~nxf failed!
            echo      Check the SQL and run manually if needed.
            pause
        ) else (
            echo %%~nxf — %date% %time% >> "%MIGRATION_LOG%"
            echo      OK — %%~nxf applied.
            set /a MIGRATION_COUNT+=1
        )
    ) else (
        echo      SKIP — %%~nxf (already applied)
    )
)

if !MIGRATION_COUNT! EQU 0 (
    echo      No new migrations to run.
) else (
    echo      !MIGRATION_COUNT! migration(s) applied.
)

:skip_migrations
echo.

REM ── Step 4: Install dependencies ───────────────────────────────────────────
echo [4/6] Installing npm dependencies...
cd /d %BACKEND%
npm install --production >nul 2>&1
echo      OK — Dependencies installed.
echo.

REM ── Step 5: Restart service ────────────────────────────────────────────────
echo [5/6] Restarting QarajAPI service...
%NSSM% restart %SERVICE%
timeout /t 3 /nobreak >nul
echo      OK — Service restarted.
echo.

REM ── Step 6: Verify ─────────────────────────────────────────────────────────
echo [6/6] Verifying service is running...
%NSSM% status %SERVICE%
echo.

REM Quick health check
curl -s http://localhost:3000/ >nul 2>&1
if errorlevel 1 (
    echo WARNING: API not responding on port 3000. Check stderr.log:
    echo          type %BACKEND%\stderr.log
) else (
    echo      OK — API is responding on port 3000.
)

echo.
echo ══════════════════════════════════════════════════════
echo   Deployment complete!
echo ══════════════════════════════════════════════════════
echo.
pause
