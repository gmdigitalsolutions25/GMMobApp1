# Qaraj GM — Changelog

All notable changes to the Qaraj GM project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH` with sequential Android `versionCode`.

---

## v1.3.70 (versionCode 74-75) — June 10, 2026

### Added
- **Pending Approval Flow** — After booking an appointment, users now see a "Pending Approval" (Təsdiq Gözlənilir) screen with a 1-hour SLA message instead of instant confirmation.
- **Missing i18n Keys** — Added `noVehiclesHint`, `findMyVehicle`, `addManually`, and `requestSent` to EN/AZ/RU translations for the V2 garage empty state.

### Fixed
- **Onboarding Gate Bypass** — Fixed a bug where users who quit mid-auth could bypass onboarding on restart. The gate now strictly checks for `!user.firstName` instead of relying on the `onboardingCompleted` flag.
- **Service Duration Labels** — Shortened Azerbaijani service duration labels from "dəqiqə" to "dəq" for better UI fit.

### Removed
- **Kill Switch** — Removed the 7-day expiration kill switch from the app layout and components. The app no longer blocks users after 7 days.

---

## v1.3.67 (versionCode 71-73) — June 10, 2026

### Added
- **"Find My Vehicle" Flow** — Added a back-office request flow for users who cannot find their vehicle. Submits a request to `vehicleRequests.create` with their phone number.
- **In-App Notification Sync** — Notifications now sync read-state with AsyncStorage.

### Fixed
- **PIN Reset Flow** — Fixed crash during PIN reset (verifyOtp → newPin step).
- **Keyboard Overlap** — Fixed PIN input fields being hidden by the keyboard using `adjustResize`.
- **Onboarding Loop** — Fixed issue where successful login looped back to onboarding by ensuring `hydrateFromServer` syncs the profile correctly.
- **Tooltip Clipping** — Fixed GM badge tooltip clipping by moving it to a Modal portal.
- **Service Label** — Changed "Servis Yaz" to "Servis" in the UI.
- **Header/Logo/Bell** — Fixed V2 HomeScreen issues including wrong header icon, missing text shadow, transparent bell background, and duplicate logo placement.
- **Push Token Endpoint** — Fixed push token registration endpoint.
- **Thin-Ring Gauges** — Updated gauge UI to use thin rings.

### Changed
- **DWH Sync Source** — DWH vehicle sync now reads from `clientdata.vehicles` instead of `public.vehicles` as the source of truth.
- **Build Profiles** — Removed `preview-v2` profile. All builds (`preview` and `production`) now use the V2 design by default (`EXPO_PUBLIC_DESIGN_V2=true`).
- **Database Schema** — Added `crm_vehicle_id` and unique index on VIN.

---

## v1.2.8 (versionCode 42) — May 1, 2026

### Fixed
- **Drizzle relations** — added `db/relations.ts` so vehicle photos load correctly on login
- **serviceTypes mismatch** — frontend now uses `serviceTypes[]` array matching the DB schema
- **Removed dead `primaryPhotoId`** from schema, types, and create route

### Changed
- **Language default** changed from `en` to `az` for new users
- **Deploy script** — `deploy-backend.bat` for one-click server deployment
- **`.gitattributes`** — forces CRLF for `.bat` files on Windows checkout

### Added
- **CRM integration fields** — `crm_customer_id` on users, `crm_vehicle_id` + `source` on vehicles
- **Service center fields** — `image_url` and `updated_at` columns
- **Migration 006** — `006_schema_cleanup_crm.sql`

---

## v1.2.7 (versionCode 40) — May 1, 2026

### Security
- **13 security hardening fixes** merged from `security/hardening` branch:
  - `crypto.randomInt` for OTP generation (replaces `Math.random`)
  - PIN bypass fix — requires OTP verified flag before `setPin` is allowed
  - `devCode` removed from production OTP responses
  - `userId` removed from `verifyOtp` response body
  - Zod max-length constraints on all string inputs
  - Timing-safe JWT comparison
  - SMS credentials removed from code comments
  - Rate-limit tightening on auth endpoints

### Fixed
- **Car placeholder** — dark-mode image properly cropped (red silhouette on black, full car visible with padding)
- Light-mode placeholder saved for future use (`car-placeholder-light.png`)

### Changed
- Repo cleanup: deleted 3 stale branches (`feature/dashboard`, `feature/dashboard-mysql-archive`, `security/hardening`)
- Only `main` + `develop` branches remain

---

## v1.2.6 (versionCode 36–39) — April 30, 2026

### Fixed
- **`state.user` crash** — `useApp()` returns flat object, not nested `{state: {user}}`; fixed destructuring across all screens
- **Phone in name field** — phone number no longer pre-fills the name input during onboarding
- **Car not saving** — onboarding car now saves to both backend and local `addVehicle()` store
- **Car placeholder** — added red silhouette on dark background (`car-placeholder.png`)

### Changed
- EAS `autoIncrement` enabled for `versionCode` in preview and production profiles

---

## v1.2.5 (versionCode 35) — April 30, 2026

### Added
- **Onboarding flow** — dual-path onboarding screen for new and returning users
  - Path A: Known customers confirm pre-filled data + fill missing fields
  - Path B: New customers complete 3-step flow (name → vehicle+mileage → service center)
- **Custom alert system** — `CustomAlert` component replacing all native `Alert.alert()` calls
  - Styled modal with `showError`, `showConfirm`, `showInfo` methods
  - Consistent branded UI across all popup dialogs
- **Backend route** — `users.updateOnboarding` tRPC procedure for saving onboarding profile data
- **DB migration 005** — adds `first_name`, `last_name`, `monthly_mileage`, `last_service_date`, `preferred_service_center`, `onboarding_completed` to users table

### Changed
- All native `Alert.alert()` calls replaced with `useAlert` hook across 6 screens:
  - `auth.tsx`, `pin-login.tsx`, `appointments.tsx`, `vehicles.tsx`, `edit-vehicle.tsx`, `vehicle-photo.tsx`
- Auth flow now routes to `/onboarding` for users with incomplete profiles
- `_layout.tsx` routing logic updated to check onboarding status on fresh sessions

---

## v1.2.4 (versionCode 34) — April 29, 2026

### Added
- **Real service center building photos** — 5 actual Groupmotors dealership images replacing generic placeholder
  - Toyota Abşeron, Mitsubishi Motors, Mazda Azərbaycan, BYD Abşeron, Toyota Gəncə
- **Server-side service center image hosting** — new `/static/service-centers/` endpoint with 30-day cache headers
- Images optimized for mobile (1200px wide, WebP format, ~85-137 KB each)

### Changed
- Service center `imageUri` switched from bundled asset (`require()`) to server URLs
- Backend `hono.ts` — added static file route for service center images

---

## v1.2.3 (versionCode 33) — April 29, 2026

### Fixed
- **PIN screen layout** — content moved higher, no longer hidden behind keyboard
- **PIN login screen** — added KeyboardAvoidingView + ScrollView for proper keyboard handling
- **Reduced top padding** on OTP/PIN steps for better vertical positioning

### Changed
- **Brand colors** — replaced cyan (#00D9FF) with Groupmotors red (#F24141) across entire app

---

## v1.2.2 (versionCode 32) — April 29, 2026

### Added
- **20 missing car model images**: BYD Chazor/Destroyer/Leopard, Mitsubishi Gallant/Lancer/Pajero, Subaru Tribeca/XV, Toyota Corolla Cross/FJ Cruiser/Hiace/Yaris Cross, Mazda CX-7/CX-9/EZ-60, Ford Courier/Custom/Fusion/Transit, Honda e:NS/Insight/Passport
- **Pull-to-refresh** on all 4 tab screens (Home, Vehicles, Appointments, Profile)
- **5 brand-specific service centers** from Groupmotors Excel: Toyota Absheron, Toyota Ganja, Mitsubishi Motors, Mazda Azerbaijan, BYD Absheron
- **Working hours display** on home screen service center cards (Mon-Sat 09:00-18:00)
- **Server infrastructure documentation** (`docs/05-Server-Infrastructure.md`)

### Changed
- `carImages.ts` expanded with 20 new model entries (131 total images)
- `mockData.ts` updated with 5 brand-specific service centers replacing single Groupmotors entry
- `appointments.tsx` service center picker updated with all 5 centers

---

## v1.2.1 (versionCode 31) — April 29, 2026

### Fixed
- **Resend OTP button was broken** — had no `onPress` handler, only showed haptic feedback
- Added working resend handler with proper API call

### Added
- **"Verification code sent" confirmation** message on OTP screen after send/resend
- **60-second cooldown timer** on Resend button to match server rate limit (3/min)
- Cooldown shows countdown: "Resend Code (45s)"
- i18n keys `codeSent` and `codeResent` for EN, AZ, RU

---

## v1.2.0 (versionCode 30) — April 29, 2026

### Added
- **Firebase Cloud Messaging (FCM)**: `google-services.json` integrated — push notifications now fully functional on Android
- **Server-hosted car images**: All 109 car model images served from `http://91.107.161.67:3000/static/cars/` with 30-day client-side caching
- **Groupmotors showroom**: Real service center at Babək pr. 78, Bakı with photo, phone, Google Maps directions
- Static file serving route in Hono backend for `/static/cars/` endpoint
- `imageCache.ts` utility for client-side image caching with 30-day TTL

### Changed
- Car images no longer bundled in APK — fetched from server on first use, cached locally
- Service centers replaced with real Groupmotors location (was mock data)
- All notification toggles ON by default

### Fixed
- Push token registration now works end-to-end (FCM → Expo Push Token → backend)

### Deployment Notes
- Server: copy `car-images/` folder to `C:\QarajGM\Backend\car-images\` and restart QarajAPI
- Firebase: project `qaraj-gm-fb5e3`, package `az.qaraj.app`

---

## v1.1.3 (versionCode 29) — April 29, 2026

### Fixed
- Push token registration now uses tRPC client (same as all other API calls) instead of raw `fetch()` with URL guessing
- Explicitly passes `projectId` to `getExpoPushTokenAsync()` to prevent silent failures
- Uses `requestPermissionsAsync()` instead of `getPermissionsAsync()` to avoid race condition after permission grant

### Note
- Push notifications still require `google-services.json` from Firebase Console (pending setup)

---

## v1.1.2 (versionCode 28) — April 29, 2026

### Fixed
- Push token registration: explicitly passes `projectId` to `getExpoPushTokenAsync()`
- Uses `requestPermissionsAsync()` instead of just checking permissions

### Changed
- All notification toggles now ON by default (promotions was previously OFF)

---

## v1.1.1 (versionCode 27) — April 29, 2026

### Added
- Push notification permission request after successful login
- Push token registration with backend after auth (auth.tsx and pin-login.tsx)
- `pushTokens.send` admin endpoint for sending notifications by phone number

### Fixed
- `registerPushToken` function rewritten to use proper backend URL resolution

---

## v1.1.0 (versionCode 26) — April 29, 2026

### Added
- 109 car model images (800px WebP, ~80 KB avg) for all 7 brands
- Images hosted on GitHub CDN via `raw.githubusercontent.com`
- `carImages.ts` rewritten with permanent self-hosted URLs

### Fixed
- Profile page version number: changed from hardcoded "1.0.0" to dynamic `Constants.expoConfig?.version`
- Honda Civic and other broken Wikimedia image URLs replaced with verified URLs

### Changed
- First release using semantic versioning (MAJOR.MINOR.PATCH)
- Branching strategy introduced: `develop` (default) + `main` (releases)

---

## v1.0.25 (versionCode 25) — April 29, 2026

### Fixed
- **Root cause fix for "Network request failed"**: Added `expo-build-properties` plugin with `usesCleartextTraffic: true` to allow HTTP traffic on Android 9+
- Without this, Android silently blocked all HTTP requests to the API server

---

## v1.0.24 (versionCode 24) — April 29, 2026

### Fixed
- Alert title showing raw `auth.error` key → changed to `t('common.error')` (translated)
- Network errors now show translated `auth.networkError` message instead of raw JS error string
- Removed silent fallback to home on PIN failure in `pin-login.tsx`
- Removed silent local user creation on PIN failure in `auth.tsx`
- All 8 catch blocks across `auth.tsx` and `pin-login.tsx` standardized with translated error handling

---

## v1.0.23 (versionCode 23) — April 29, 2026

### Added
- `AppVersion` component showing version on welcome, auth, and PIN login screens
- `networkError` i18n key for EN, AZ, and RU languages
- `EXPO_PUBLIC_API_BASE_URL` baked into EAS builds via `eas.json`

### Fixed
- Removed "Dev: Use OTP 123456" fallback in catch blocks — was masking real API errors

---

## v1.0.22 (versionCode 22) — April 28, 2026

### Added
- PIN reset functionality (forgot PIN → OTP re-verification → set new PIN)
- Biometric authentication (fingerprint/face unlock)
- Local notification scheduling for appointment reminders
- Notification settings screen with 5 toggleable categories

### Changed
- Auth flow supports returning users (OTP → verify PIN) vs new users (OTP → set PIN)

---

## v1.0.21 (versionCode 21) — April 27, 2026

### Added
- Brands and models loaded from PostgreSQL database (7 brands, 109 models)
- VIN validation: 17 alphanumeric characters, no I/O/Q
- Azerbaijan license plate format enforcement (NN-CC-NNN)
- Mileage field in vehicle registration
- Phone-based profile hydration (`users.getFullProfile`)
- Softline SMS integration (sender: "TOYOTA" at the time)
- Monitoring subsystem: error logs, bug reports, system health
- `brandsModels.list` and `brandsModels.byBrand` tRPC routes
- Documentation: BRD, TAD, API Reference, Service Desk spec, deployment guide
- CI/CD workflows (manual trigger only)

---

## v1.0.20 and earlier — April 25–26, 2026

### Added
- Initial app scaffold with Expo SDK 54, React Native, TypeScript
- tRPC API with Hono backend
- PostgreSQL database on Neon with Drizzle ORM
- OTP-based authentication via SMS
- PIN-based login with bcrypt hashing
- JWT session management
- Vehicle CRUD operations
- Service center directory
- Appointment booking
- AI-powered spare parts advisor (OpenAI gpt-4.1-mini)
- Multi-language support (EN, AZ, RU)
- Dark theme UI
- Windows Server deployment with NSSM service manager

---

*This changelog is maintained in the Qaraj GM project repository.*
repository.*
