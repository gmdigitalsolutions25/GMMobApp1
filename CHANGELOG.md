# Qaraj GM — Changelog

All notable changes to the Qaraj GM project are documented in this file.

The format follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH` with sequential Android `versionCode`.

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
