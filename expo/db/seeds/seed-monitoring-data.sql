-- ============================================================================
-- Seed Data: Monitoring Dashboard — Error Logs, Bug Reports, Health Snapshots
-- Qaraj GM Backend
-- Run AFTER migration 003_monitoring_tables.sql
-- ============================================================================

-- ── Error Logs: Realistic mix of API, mobile, system, auth, and SMS errors ──

INSERT INTO error_logs (severity, source, endpoint, message, stack_trace, user_phone, device_info, app_version, ip_address, resolved, resolved_at, resolved_by, notes, created_at) VALUES

-- Critical errors (2)
('critical', 'database', '/api/trpc/vehicles.getByPhone', 'Connection pool exhausted — all 10 connections in use, query timeout after 30s', 'Error: Connection terminated unexpectedly\n  at Connection.con.on (postgres.js:1:2345)\n  at processTicksAndRejections (node:internal/process/task_queues:90:21)', NULL, NULL, 'v1.0.3', '91.107.161.67', true, NOW() - INTERVAL '2 days', 'Elnur', 'Increased pool size to 20 and added connection timeout handling', NOW() - INTERVAL '3 days'),

('critical', 'system', '/api/trpc/auth.verifyOtp', 'OTP store memory leak — Map size exceeded 50,000 entries, forced cleanup triggered', 'Warning: Map.size = 52341\n  at otpStore.set (otp-store.ts:15:5)\n  at sendOtp (send-otp/route.ts:42:12)', NULL, NULL, 'v1.0.2', '91.107.161.67', true, NOW() - INTERVAL '1 day', 'Manus', 'Fixed in v1.0.3: shared OTP store with automatic expiry cleanup every 5 minutes', NOW() - INTERVAL '2 days'),

-- High severity errors (5)
('high', 'sms', '/api/trpc/auth.sendOtp', 'Softline SMS API returned errno=40: Invalid username/password', NULL, '+994502144418', NULL, 'v1.0.3', '10.0.2.15', false, NULL, NULL, NULL, NOW() - INTERVAL '4 hours'),

('high', 'auth', '/api/trpc/auth.verifyPin', 'Rate limit exceeded — 15 failed PIN attempts from +994551234567 in 5 minutes', NULL, '+994551234567', 'Samsung Galaxy S23, Android 14', 'v1.0.3', '185.129.44.12', false, NULL, NULL, NULL, NOW() - INTERVAL '6 hours'),

('high', 'api', '/api/trpc/appointments.create', 'Foreign key constraint violation — service_center_id does not exist in service_centers table', 'Error: insert or update on table "appointments" violates foreign key constraint "appointments_service_center_id_fkey"\n  at processTicksAndRejections (node:internal/process/task_queues:90:21)', '+994503456789', 'iPhone 15 Pro, iOS 17.4', 'v1.0.3', '37.26.100.55', true, NOW() - INTERVAL '12 hours', 'Elnur', 'User selected a service center that was deleted. Added soft-delete check.', NOW() - INTERVAL '1 day'),

('high', 'mobile', 'VehicleDetailScreen', 'Unhandled promise rejection: TypeError: Cannot read properties of undefined (reading "brand")', 'TypeError: Cannot read properties of undefined (reading "brand")\n  at VehicleDetailScreen (vehicle-detail.tsx:45:22)\n  at renderWithHooks (react-dom.development.js:14985:18)', '+994701112233', 'Xiaomi Redmi Note 12, Android 13', 'v1.0.2', NULL, true, NOW() - INTERVAL '18 hours', 'Manus', 'Fixed null check for vehicle data when navigating from push notification', NOW() - INTERVAL '2 days'),

('high', 'auth', '/api/trpc/auth.sendOtp', 'Suspicious activity: 50 OTP requests from same IP in 10 minutes — possible enumeration attack', NULL, NULL, NULL, NULL, '185.220.101.42', false, NULL, NULL, NULL, NOW() - INTERVAL '8 hours'),

-- Medium severity errors (8)
('medium', 'api', '/api/trpc/vehicles.create', 'Duplicate VIN detected — vehicle with VIN WBAPH5C55BA123456 already exists for another user', NULL, '+994509876543', 'Samsung Galaxy A54, Android 14', 'v1.0.3', '37.26.88.100', false, NULL, NULL, NULL, NOW() - INTERVAL '2 hours'),

('medium', 'mobile', 'AppointmentScreen', 'Network request failed: timeout after 15000ms calling appointments.create', 'Error: Network request failed\n  at fetch (network.ts:22:10)\n  at trpc.appointments.create.mutate (trpc.ts:55:8)', '+994553334455', 'iPhone 14, iOS 17.3', 'v1.0.3', NULL, false, NULL, NULL, NULL, NOW() - INTERVAL '5 hours'),

('medium', 'api', '/api/trpc/users.getByPhone', 'Query returned empty result for registered user +994501234567 — possible phone normalization mismatch', NULL, '+994501234567', NULL, 'v1.0.3', '10.0.2.15', true, NOW() - INTERVAL '1 day', 'Manus', 'Fixed: normalizePhone now consistently extracts last 9 digits', NOW() - INTERVAL '2 days'),

('medium', 'system', 'startup', 'Environment variable JWT_SECRET not set — using auto-generated secret (will invalidate all sessions on restart)', NULL, NULL, NULL, 'v1.0.3', '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),

('medium', 'mobile', 'AuthScreen', 'Biometric authentication failed: User cancelled biometric prompt', NULL, '+994502144418', 'Samsung Galaxy S24 Ultra, Android 14', 'v1.0.3', NULL, false, NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),

('medium', 'api', '/api/trpc/ai.spareParts', 'OpenAI API rate limit exceeded — 429 Too Many Requests', 'Error: 429 Too Many Requests\n  at fetch (openai.ts:88:12)', '+994701234567', NULL, 'v1.0.3', '37.26.100.55', true, NOW() - INTERVAL '6 hours', 'System', 'Auto-resolved: retry succeeded after 60s backoff', NOW() - INTERVAL '10 hours'),

('medium', 'database', '/api/trpc/appointments.getByUser', 'Slow query detected: 3200ms for appointments join with service_records (user has 47 records)', NULL, '+994505556677', NULL, 'v1.0.3', '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '12 hours'),

('medium', 'sms', '/api/trpc/auth.sendOtp', 'Softline SMS delivery status: errno=60 — Insufficient balance', NULL, '+994557778899', NULL, 'v1.0.3', '37.26.88.100', false, NULL, NULL, NULL, NOW() - INTERVAL '1 hour'),

-- Low severity errors (10)
('low', 'api', '/favicon.ico', 'HTTP 404: /favicon.ico', NULL, NULL, NULL, NULL, '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '30 minutes'),

('low', 'api', '/robots.txt', 'HTTP 404: /robots.txt', NULL, NULL, NULL, NULL, '185.191.171.5', false, NULL, NULL, NULL, NOW() - INTERVAL '1 hour'),

('low', 'mobile', 'HomeScreen', 'AsyncStorage warning: key "lastSyncTime" exceeds recommended size (2.1KB)', NULL, '+994502144418', 'Samsung Galaxy S24 Ultra, Android 14', 'v1.0.3', NULL, false, NULL, NULL, NULL, NOW() - INTERVAL '4 hours'),

('low', 'api', '/api/trpc/serviceCenters.list', 'Response size warning: 45KB payload for service centers list (consider pagination)', NULL, NULL, NULL, 'v1.0.3', '10.0.2.15', false, NULL, NULL, NULL, NOW() - INTERVAL '8 hours'),

('low', 'system', 'security', 'Blocked request from non-AZ IP: 45.33.32.156 (US) — firewall rule applied', NULL, NULL, NULL, NULL, '45.33.32.156', false, NULL, NULL, NULL, NOW() - INTERVAL '2 hours'),

('low', 'system', 'security', 'Blocked request from non-AZ IP: 103.224.182.250 (CN) — firewall rule applied', NULL, NULL, NULL, NULL, '103.224.182.250', false, NULL, NULL, NULL, NOW() - INTERVAL '5 hours'),

('low', 'api', '/api/trpc/example.hi', 'Deprecated endpoint called — example.hi should be removed in production', NULL, NULL, NULL, 'v1.0.3', '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '6 hours'),

('low', 'mobile', 'SettingsScreen', 'Font loading warning: custom font "Inter-Bold" took 3.2s to load on slow connection', NULL, '+994553334455', 'Huawei P30 Lite, Android 12', 'v1.0.2', NULL, false, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),

('low', 'system', 'startup', 'Node.js deprecation warning: punycode module is deprecated (from postgres.js dependency)', NULL, NULL, NULL, 'v1.0.3', '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '2 days'),

('low', 'api', '/monitoring', 'Monitoring dashboard accessed from whitelisted IP 91.107.161.67', NULL, NULL, NULL, NULL, '91.107.161.67', false, NULL, NULL, NULL, NOW() - INTERVAL '15 minutes');


-- ── Bug Reports: Realistic user and tester reports ──────────────────────────

INSERT INTO bug_reports (reporter_name, reporter_phone, reporter_role, title, description, steps_to_reproduce, expected_behavior, actual_behavior, severity, status, assigned_to, resolution, device_info, app_version, created_at, updated_at) VALUES

-- Critical bugs (1)
('Elnur Hasanov', '+994502144418', 'admin', 'App crashes on launch after Android 14 update',
 'Multiple users reporting app crashes immediately after opening. Started after Samsung pushed Android 14 update to Galaxy S23 series.',
 '1. Update Samsung Galaxy S23 to Android 14\n2. Open Qaraj GM app\n3. App shows splash screen then crashes',
 'App should open normally and show auth/home screen',
 'App crashes with white screen after 2 seconds. No error message shown to user.',
 'critical', 'resolved', 'Manus',
 'Root cause: expo-secure-store incompatibility with Android 14 scoped storage. Fixed by updating expo-secure-store to v13.0.1.',
 'Samsung Galaxy S23, Android 14', 'v1.0.2',
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

-- High bugs (3)
('Rashad Mammadov', '+994551234567', 'tester', 'OTP not received on Bakcell numbers',
 'Tested with 3 different Bakcell numbers — none received OTP SMS. Azercell and Nar numbers work fine.',
 '1. Enter Bakcell number (+994552XXXXXX)\n2. Tap "Send OTP"\n3. Wait for SMS',
 'SMS should arrive within 30 seconds',
 'No SMS received after 5 minutes. API returns success but Softline may be blocking Bakcell routes.',
 'high', 'new', NULL, NULL,
 'iPhone 15, iOS 17.4', 'v1.0.3',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Kamran Aliyev', '+994703456789', 'service_center', 'Cannot see appointment details for walk-in customers',
 'When a customer walks in without an appointment, we create one on the spot. But the appointment detail screen shows "No data" even after creating it.',
 '1. Go to Appointments tab\n2. Tap "New Appointment"\n3. Fill in details and submit\n4. Tap on the newly created appointment',
 'Should show full appointment details with customer info and vehicle',
 'Shows empty screen with "No appointment data found" message. Have to close and reopen the app to see it.',
 'high', 'acknowledged', 'Manus', NULL,
 'Samsung Galaxy Tab S9, Android 14', 'v1.0.3',
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

('Nigar Huseynova', '+994509876543', 'user', 'My second car disappeared from the app',
 'I had two cars registered — Toyota Camry 2020 and Honda CR-V 2022. After the last update, only the Camry shows up. The CR-V is gone.',
 '1. Open app\n2. Go to "My Vehicles"\n3. Only one car is shown instead of two',
 'Both vehicles should be listed',
 'Only Toyota Camry 2020 is shown. Honda CR-V 2022 is missing.',
 'high', 'in_progress', 'Manus', NULL,
 'iPhone 14 Pro Max, iOS 17.3', 'v1.0.3',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '12 hours'),

-- Medium bugs (5)
('Farid Guliyev', '+994553334455', 'tester', 'Appointment time picker shows wrong timezone',
 'The time picker shows UTC time instead of Baku time (UTC+4). If I select 14:00, the appointment is created for 10:00.',
 '1. Create new appointment\n2. Select date and time 14:00\n3. Submit\n4. Check appointment in list',
 'Appointment should show 14:00 (Baku time)',
 'Appointment shows 10:00 — exactly 4 hours behind. Server stores UTC but client doesn''t convert.',
 'medium', 'new', NULL, NULL,
 'Samsung Galaxy S22, Android 13', 'v1.0.3',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Leyla Ahmadova', '+994701112233', 'user', 'Push notifications arrive but tapping them does nothing',
 'I receive push notifications for appointment reminders, but when I tap on them, the app opens to the home screen instead of the appointment.',
 '1. Receive push notification "Your appointment is tomorrow at 10:00"\n2. Tap the notification\n3. App opens',
 'Should navigate to the specific appointment detail screen',
 'Opens to home screen. Have to manually navigate to Appointments tab.',
 'medium', 'new', NULL, NULL,
 'Xiaomi Redmi Note 12, Android 13', 'v1.0.3',
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Tural Hasanli', '+994505556677', 'tester', 'Service history shows prices in wrong format',
 'Service record prices show as raw numbers without currency formatting. "15000" instead of "150.00 AZN".',
 '1. Go to vehicle detail\n2. Scroll to service history\n3. Check price column',
 'Prices should show as "150.00 AZN" with proper formatting',
 'Shows "15000" — appears to be stored in qapik (minor unit) but displayed without conversion.',
 'medium', 'acknowledged', 'Manus', NULL,
 'Samsung Galaxy A54, Android 14', 'v1.0.3',
 NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),

('Aynur Mammadova', '+994557778899', 'user', 'Cannot change my phone number in profile',
 'I got a new SIM card and want to update my phone number, but there is no option to change it in the profile settings.',
 '1. Go to Profile/Settings\n2. Look for phone number edit option',
 'Should have an option to change phone number (with OTP verification on new number)',
 'No edit button next to phone number. Phone number is displayed but not editable.',
 'medium', 'new', NULL, NULL,
 'iPhone 13, iOS 17.2', 'v1.0.3',
 NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('Orkhan Jafarov', '+994702223344', 'service_center', 'Photo upload fails for large images',
 'When trying to upload vehicle photos taken with the camera (12MP, ~5MB each), the upload fails silently. Smaller screenshots work fine.',
 '1. Go to vehicle detail\n2. Tap "Add Photo"\n3. Take photo with camera (12MP)\n4. Confirm upload',
 'Photo should upload and appear in vehicle gallery',
 'Upload spinner shows for ~30 seconds then disappears. No photo added. No error message.',
 'medium', 'in_progress', 'Manus', NULL,
 'Samsung Galaxy S24, Android 14', 'v1.0.3',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

-- Low bugs (4)
('Elnur Hasanov', '+994502144418', 'admin', 'Monitoring dashboard font too small on mobile',
 'When accessing /monitoring from phone browser, the text is very small and hard to read. No responsive design.',
 '1. Open monitoring dashboard on mobile browser\n2. Try to read error logs table',
 'Dashboard should be responsive and readable on mobile',
 'Text is tiny, table overflows horizontally, buttons are hard to tap.',
 'low', 'new', NULL, NULL,
 'Samsung Galaxy S24 Ultra, Chrome Mobile', 'v1.0.3',
 NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

('Rashad Mammadov', '+994551234567', 'tester', 'Dark mode toggle doesn''t persist after app restart',
 'If I switch to light mode and close the app, it reverts to dark mode when I reopen.',
 '1. Go to Settings\n2. Switch to Light mode\n3. Close app completely\n4. Reopen app',
 'Theme preference should persist',
 'Always opens in dark mode regardless of saved preference.',
 'low', 'new', NULL, NULL,
 'iPhone 15, iOS 17.4', 'v1.0.3',
 NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('Farid Guliyev', '+994553334455', 'tester', 'Azerbaijani language strings missing on some screens',
 'Some screens show English text even when language is set to Azerbaijani. Mainly the appointment creation form and error messages.',
 '1. Set language to Azerbaijani in Settings\n2. Go to Create Appointment\n3. Check form labels',
 'All text should be in Azerbaijani',
 'Form labels like "Select Date", "Choose Service Center" remain in English.',
 'low', 'acknowledged', NULL, NULL,
 'Samsung Galaxy S22, Android 13', 'v1.0.3',
 NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

('Kamran Aliyev', '+994703456789', 'service_center', 'Search by VIN number is case-sensitive',
 'When searching for a vehicle by VIN, entering lowercase letters returns no results even though the VIN exists.',
 '1. Go to vehicle search\n2. Enter VIN in lowercase: "wbaph5c55ba123456"\n3. Tap search',
 'Search should be case-insensitive for VIN',
 'Returns "No vehicle found". Works only with uppercase "WBAPH5C55BA123456".',
 'low', 'new', NULL, NULL,
 'Samsung Galaxy Tab S9, Android 14', 'v1.0.3',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');


-- ── System Health Snapshots: 48 hours of hourly data ────────────────────────

INSERT INTO system_health_snapshots (api_status, db_status, sms_status, api_response_time_ms, db_response_time_ms, total_users, total_vehicles, total_appointments, pending_appointments, error_count_today, uptime_seconds, node_version, api_version, created_at) VALUES
-- 48 hours ago to now, hourly snapshots showing realistic patterns
('healthy', 'healthy', 'mock', 12, 3, 1, 2, 3, 1, 0, 3600, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '48 hours'),
('healthy', 'healthy', 'mock', 15, 4, 1, 2, 3, 1, 0, 7200, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '47 hours'),
('healthy', 'healthy', 'mock', 11, 3, 1, 2, 3, 1, 1, 10800, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '46 hours'),
('healthy', 'healthy', 'mock', 14, 5, 1, 2, 4, 2, 1, 14400, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '45 hours'),
('healthy', 'healthy', 'mock', 13, 3, 1, 3, 4, 2, 1, 18000, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '44 hours'),
('healthy', 'healthy', 'mock', 18, 6, 2, 3, 5, 2, 2, 21600, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '43 hours'),
('healthy', 'healthy', 'mock', 22, 8, 2, 3, 5, 2, 2, 25200, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '42 hours'),
('healthy', 'healthy', 'mock', 35, 12, 2, 4, 6, 3, 3, 28800, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '41 hours'),
('healthy', 'healthy', 'mock', 28, 9, 2, 4, 7, 3, 3, 32400, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '40 hours'),
('healthy', 'healthy', 'mock', 45, 15, 3, 5, 8, 4, 4, 36000, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '39 hours'),
('healthy', 'healthy', 'mock', 38, 11, 3, 5, 8, 3, 4, 39600, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '38 hours'),
('healthy', 'healthy', 'mock', 25, 7, 3, 5, 9, 3, 5, 43200, 'v22.13.0', 'v1.0.2', NOW() - INTERVAL '37 hours'),
-- Service restart (simulated downtime)
('healthy', 'healthy', 'mock', 10, 2, 3, 5, 9, 3, 0, 100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '36 hours'),
('healthy', 'healthy', 'mock', 12, 3, 3, 5, 9, 3, 0, 3700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '35 hours'),
('healthy', 'healthy', 'mock', 14, 4, 3, 6, 10, 4, 1, 7300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '34 hours'),
('healthy', 'healthy', 'mock', 16, 5, 4, 6, 10, 4, 1, 10900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '33 hours'),
('healthy', 'healthy', 'mock', 20, 7, 4, 7, 11, 4, 2, 14500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '32 hours'),
('healthy', 'healthy', 'mock', 32, 10, 4, 7, 12, 5, 2, 18100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '31 hours'),
('healthy', 'healthy', 'mock', 40, 14, 5, 8, 13, 5, 3, 21700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '30 hours'),
('healthy', 'healthy', 'mock', 55, 18, 5, 8, 14, 6, 4, 25300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '29 hours'),
-- Peak load period
('healthy', 'degraded', 'mock', 120, 45, 5, 9, 15, 6, 5, 28900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '28 hours'),
('healthy', 'healthy', 'mock', 65, 20, 5, 9, 15, 5, 5, 32500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '27 hours'),
('healthy', 'healthy', 'mock', 30, 8, 5, 9, 16, 5, 6, 36100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '26 hours'),
('healthy', 'healthy', 'mock', 22, 6, 5, 9, 16, 5, 6, 39700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '25 hours'),
-- Overnight (low traffic)
('healthy', 'healthy', 'configured', 10, 2, 5, 9, 16, 4, 6, 43300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '24 hours'),
('healthy', 'healthy', 'configured', 8, 2, 5, 9, 16, 4, 0, 46900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '23 hours'),
('healthy', 'healthy', 'configured', 9, 2, 5, 9, 16, 4, 0, 50500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '22 hours'),
('healthy', 'healthy', 'configured', 8, 2, 5, 9, 16, 4, 0, 54100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '21 hours'),
('healthy', 'healthy', 'configured', 9, 3, 5, 9, 16, 4, 0, 57700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '20 hours'),
('healthy', 'healthy', 'configured', 8, 2, 5, 9, 16, 4, 0, 61300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '19 hours'),
-- Morning ramp-up
('healthy', 'healthy', 'configured', 12, 3, 5, 9, 17, 5, 1, 64900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '18 hours'),
('healthy', 'healthy', 'configured', 15, 4, 6, 10, 17, 5, 1, 68500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '17 hours'),
('healthy', 'healthy', 'configured', 22, 7, 6, 10, 18, 6, 2, 72100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '16 hours'),
('healthy', 'healthy', 'configured', 30, 9, 6, 11, 19, 7, 3, 75700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '15 hours'),
('healthy', 'healthy', 'configured', 42, 13, 7, 11, 20, 7, 4, 79300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '14 hours'),
('healthy', 'healthy', 'configured', 55, 17, 7, 12, 21, 8, 5, 82900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '13 hours'),
-- Peak business hours
('healthy', 'healthy', 'configured', 68, 22, 7, 12, 22, 8, 6, 86500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '12 hours'),
('healthy', 'healthy', 'configured', 75, 25, 8, 13, 23, 9, 7, 90100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '11 hours'),
('healthy', 'healthy', 'configured', 82, 28, 8, 13, 24, 9, 8, 93700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '10 hours'),
('healthy', 'healthy', 'configured', 70, 23, 8, 14, 25, 10, 9, 97300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '9 hours'),
('healthy', 'healthy', 'configured', 58, 18, 8, 14, 25, 9, 10, 100900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '8 hours'),
('healthy', 'healthy', 'configured', 45, 14, 8, 14, 26, 9, 12, 104500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '7 hours'),
('healthy', 'healthy', 'configured', 38, 11, 8, 14, 26, 8, 14, 108100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '6 hours'),
('healthy', 'healthy', 'configured', 30, 9, 8, 14, 27, 8, 16, 111700, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '5 hours'),
('healthy', 'healthy', 'configured', 25, 7, 8, 14, 27, 7, 18, 115300, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '4 hours'),
('healthy', 'healthy', 'configured', 20, 5, 8, 14, 27, 7, 20, 118900, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '3 hours'),
('healthy', 'healthy', 'configured', 18, 4, 8, 14, 27, 6, 22, 122500, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '2 hours'),
('healthy', 'healthy', 'configured', 15, 4, 8, 14, 27, 6, 24, 126100, 'v22.13.0', 'v1.0.3', NOW() - INTERVAL '1 hour');

-- ============================================================================
-- Verification
-- ============================================================================
SELECT 'error_logs' AS table_name, COUNT(*) AS row_count FROM error_logs
UNION ALL
SELECT 'bug_reports', COUNT(*) FROM bug_reports
UNION ALL
SELECT 'system_health_snapshots', COUNT(*) FROM system_health_snapshots;
