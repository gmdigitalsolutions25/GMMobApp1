@echo on
REM ====================================================================
REM  Qaraj GM -- Backend Deployment Script
REM  Run as Administrator on Windows Server (91.107.161.67)
REM ====================================================================

echo.
echo ======================================================
echo   QARAJ GM -- Backend Deployment
echo   %date% %time%
echo ======================================================
echo.

REM -- Step 1: Pull latest code
echo.
echo [1/5] Pulling latest code from GitHub...
cd /d C:\QarajGM\repo
git pull origin main
echo.

REM -- Step 2: Copy backend + db files
echo [2/5] Copying backend and db files...
xcopy /E /Y "C:\QarajGM\repo\expo\backend\*" "C:\QarajGM\Backend\backend\"
xcopy /E /Y "C:\QarajGM\repo\expo\db\*" "C:\QarajGM\Backend\db\"
echo.

REM -- Step 3: Install dependencies
echo [3/5] Installing npm dependencies...
cd /d C:\QarajGM\Backend
call npm install --production
echo.

REM -- Step 4: Restart service
echo [4/5] Restarting QarajAPI service...
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI
timeout /t 5 /nobreak
echo.

REM -- Step 5: Verify
echo [5/5] Checking service status...
C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe status QarajAPI
echo.
curl -s http://localhost:3000/
echo.

echo.
echo ======================================================
echo   Deployment complete!
echo   NOTE: Run migration 006 manually in pgAdmin if needed.
echo   File: C:\QarajGM\repo\expo\backend\migrations\006_schema_cleanup_crm.sql
echo ======================================================
echo.
pause
