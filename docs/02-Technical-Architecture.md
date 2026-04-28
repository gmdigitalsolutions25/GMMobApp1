# Qaraj GM — Technical Architecture Document (TAD)

**Version:** 2.0
**Date:** April 29, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Active — Pre-Production Testing

---

## 1. System Overview

Qaraj GM is a modern, full-stack mobile application designed for high performance, type safety, and rapid iteration. The architecture follows a client-server model with a React Native mobile frontend communicating with a Node.js backend via a strictly typed tRPC API.

The system serves **Group Motors**, an authorized multi-brand dealer group representing 7 automotive brands (BYD, Ford, Honda, Mazda, Mitsubishi, Subaru, Toyota) with 109 vehicle models. The backend is deployed on a single Windows Server instance in Baku, Azerbaijan, with PostgreSQL database hosting provided by Neon.

---

## 2. Technology Stack

### 2.1 Frontend (Mobile App)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React Native with Expo (SDK 54) | Cross-platform mobile development |
| Language | TypeScript | Type safety across the stack |
| Routing | Expo Router (file-based routing) | Navigation and deep linking |
| Styling | NativeWind (Tailwind CSS for React Native) | Utility-first styling |
| API Client | tRPC Client (`@trpc/client`, `@trpc/react-query`) | Type-safe API communication |
| State Management | React Query (via tRPC), Zustand | Server state + local state |
| Local Storage | `expo-secure-store` (JWT tokens), `AsyncStorage` | Encrypted and general storage |
| Authentication | `expo-local-authentication` (Biometrics) | Fingerprint/Face unlock |
| Notifications | `expo-notifications` | Push notification handling |
| Image Caching | Custom `imageCache.ts` with `FileSystem` | 30-day car image caching |
| Build Properties | `expo-build-properties` | Android native config (cleartext HTTP) |

### 2.2 Backend (API Server)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js (v22.13.0) | Server-side JavaScript execution |
| Framework | Hono (lightweight web framework) | HTTP server, middleware, static files |
| API Layer | tRPC Server (`@trpc/server`, `@hono/trpc-server`) | Type-safe RPC endpoints |
| Language | TypeScript (executed via `tsx`) | End-to-end type safety |
| Validation | Zod | Schema validation for all inputs/outputs |
| ORM | Drizzle ORM | Type-safe database queries |
| Database | PostgreSQL (Neon) | Persistent data storage |
| Process Manager | NSSM (Non-Sucking Service Manager) | Windows service lifecycle |
| Static Files | Hono `serveStatic` | Car model images serving |

### 2.3 Infrastructure and DevOps

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Hosting | Windows Server (`91.107.161.67`) | Single-server deployment |
| CI/CD | GitHub Actions (manual dispatch) | Automated APK/AAB builds |
| Mobile Builds | EAS Build (Expo Application Services) | Cloud-based Android APK builds |
| SMS Gateway | Softline HTTP API | OTP delivery (sender: "Groupmotors") |
| AI Integration | OpenAI API (`gpt-4.1-mini`) | Spare parts advisory |
| Push Delivery | Expo Push Service → FCM | Push notification delivery |
| Version Control | GitHub (private repo) | Source code, car images, documentation |
| Branching | `develop` (default) + `main` (releases) | Git flow branching strategy |

---

## 3. Architecture Diagram

```mermaid
graph TD
    subgraph Mobile Client [Expo React Native App - SDK 54]
        UI[UI Components]
        Router[Expo Router]
        TRPC_Client[tRPC Client]
        SecureStore[(Secure Store)]
        ImageCache[(Image Cache - 30 day)]
        PushReg[Push Token Registration]
        
        UI <--> Router
        Router <--> TRPC_Client
        TRPC_Client <--> SecureStore
        UI <--> ImageCache
        TRPC_Client <--> PushReg
    end

    subgraph Windows Server [91.107.161.67:3000]
        NSSM[NSSM Service Manager]
        
        subgraph Node.js Process
            Hono[Hono Web Server]
            Static[Static File Server - /static/cars/]
            Middleware[Security Middleware]
            TRPC_Server[tRPC Router]
            Drizzle[Drizzle ORM]
            
            Hono --> Static
            Hono --> Middleware
            Middleware --> TRPC_Server
            TRPC_Server --> Drizzle
        end
        
        NSSM --> |Manages| Hono
    end

    subgraph External Services
        PostgreSQL[(PostgreSQL - Neon)]
        Softline[Softline SMS API]
        OpenAI[OpenAI API]
        ExpoPush[Expo Push Service]
        FCM[Firebase Cloud Messaging]
        EAS[EAS Build Service]
    end

    TRPC_Client <==> |HTTP POST /api/trpc/*| Hono
    ImageCache --> |HTTP GET /static/cars/*| Static
    Drizzle <==> |TCP 5432| PostgreSQL
    TRPC_Server --> |HTTP GET| Softline
    TRPC_Server --> |HTTP POST| OpenAI
    TRPC_Server --> |HTTP POST| ExpoPush
    ExpoPush --> |FCM v1| FCM
    FCM --> |Push| Mobile Client
    EAS --> |Builds APK| Mobile Client
```

---

## 4. Security Architecture

Security is implemented in multiple layers, from the network level down to the application logic.

### 4.1 Network and Infrastructure Level

The Windows Firewall restricts incoming traffic on port 3000 to Azerbaijani IP ranges only. The `/monitoring` dashboard is further restricted to specific admin IPs (localhost and the server's own IP). All API traffic currently uses HTTP; migration to HTTPS is planned for Play Store compliance.

### 4.2 Application Middleware Level

All mobile app requests must include the `x-api-key` header for authentication. Rate limiting is applied per-IP using an in-memory store to prevent brute force and abuse.

| Endpoint Category | Rate Limit | Purpose |
|-------------------|-----------|---------|
| OTP (sendOtp, verifyOtp) | 3–5 req/min | Prevent SMS abuse |
| PIN (setPin, verifyPin) | 10 req/min | Prevent brute force |
| AI (spareParts) | 5 req/min | Control OpenAI costs |
| Push token registration | 5 req/min | Prevent spam |
| Standard CRUD | 60 req/min | General protection |

Security headers are applied to all responses: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`. CORS is restricted to configured origins.

### 4.3 Authentication and Session Level

User PINs are hashed using `bcryptjs` before database storage. Successful authentication issues a JSON Web Token (JWT) signed with `HMAC-SHA256`. The mobile app stores the JWT in the device's encrypted keychain (`expo-secure-store`). Biometric unlock uses local device biometrics to access the stored JWT without server communication.

### 4.4 Android Network Security

Since the API server uses HTTP (not HTTPS), the Android build includes `usesCleartextTraffic: true` via the `expo-build-properties` plugin. This is required for Android 9+ which blocks cleartext HTTP by default. This configuration will be removed once the server migrates to HTTPS.

---

## 5. Data Architecture

The database uses PostgreSQL hosted on Neon, managed via Drizzle ORM. The schema is defined in TypeScript, providing end-to-end type safety from the database to the mobile UI.

### 5.1 Core Entities

| Table | Purpose | Key Relations | Key Fields |
|-------|---------|---------------|------------|
| `users` | Customer identity and preferences | Phone (unique index) | phone, name, pinHash, language, theme |
| `vehicles` | Registered vehicles | → users (cascade delete) | vin, licensePlate, brand, model, year, mileage |
| `vehicle_photos` | Vehicle images | → vehicles (cascade delete) | uri, isPrimary |
| `service_centers` | Group Motors locations | Standalone reference | name, address, phone, coordinates, rating |
| `appointments` | Service bookings | → users, → vehicles, → service_centers | status, date, time, serviceTypes |
| `service_records` | Completed service history | → vehicles | serviceType, cost, mileage, technician, parts |
| `otp_codes` | SMS verification codes | Phone indexed | code, expiresAt |
| `push_tokens` | Mobile notification tokens | → users | token, platform, active |

### 5.2 Reference Data Entities

| Table | Purpose | Key Relations | Key Fields |
|-------|---------|---------------|------------|
| `brands` | Automotive brand catalog (7 brands) | Standalone | name, slug |
| `models` | Vehicle model catalog (109 models) | → brands | name, slug |

### 5.3 Monitoring Entities

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `error_logs` | Server and client error tracking | severity, message, stackTrace, deviceInfo |
| `bug_reports` | Team bug reporting | title, description, status, assignedTo |
| `system_health_snapshots` | Periodic health metrics | timestamp, metrics JSON |

---

## 6. API Architecture

The API is organized as a tRPC router with the following route groups:

### 6.1 tRPC Routes

| Route Group | Procedures | Purpose |
|-------------|-----------|---------|
| `auth` | sendOtp, verifyOtp, setPin, verifyPin, resetPin | User authentication flow |
| `users` | getFullProfile, updateProfile, getByPhone | User management |
| `vehicles` | create, list, update, delete | Vehicle CRUD |
| `vehiclePhotos` | upload, list, setPrimary, delete | Vehicle photo management |
| `appointments` | create, list, updateStatus | Service booking |
| `serviceRecords` | create, listByVehicle | Service history |
| `serviceCenters` | list, getById | Service center directory |
| `spareParts` | search | AI-powered parts advisory |
| `brandsModels` | list, byBrand | Brand/model catalog |
| `pushTokens` | register, send | Push notification management |
| `monitoring.errors` | list, create, resolve | Error tracking |
| `monitoring.bugs` | list, create, update | Bug reporting |
| `monitoring.health` | live, summary | System health |

### 6.2 Static File Routes

| Path | Purpose | Format |
|------|---------|--------|
| `/static/cars/{brand}/{model}.webp` | Car model images | 800px WebP, 45–144 KB |
| `/monitoring` | Admin monitoring dashboard | HTML |

---

## 7. Car Image Architecture

Car model images are served as static files from the backend and cached on the client device for 30 days.

### 7.1 Server Side

The backend serves images from the `car-images/` directory via Hono's static file middleware at the `/static/cars/` path. Images are organized by brand: `/static/cars/honda/civic.webp`. All 109 model images are 800px wide WebP files, averaging 80 KB each (8.5 MB total).

### 7.2 Client Side

The `imageCache.ts` module manages client-side caching using Expo's `FileSystem` API. When a car image is first requested, it downloads from the server and stores it in the app's document directory. Subsequent requests serve from the local cache. The cache expires after 30 days, triggering a fresh download. This approach minimizes bandwidth usage while allowing server-side image updates without app rebuilds.

### 7.3 Image Flow

```
User selects brand/model → carImages.ts provides server URL →
imageCache.ts checks local cache → if cached & < 30 days → serve local →
if not cached or expired → download from server → cache locally → serve
```

---

## 8. Push Notification Architecture

Push notifications use the Expo Push Service as an intermediary between the backend and Firebase Cloud Messaging (FCM).

### 8.1 Token Registration Flow

After successful authentication (OTP → PIN → home screen), the mobile app requests notification permissions from the user. If granted, it obtains an Expo Push Token via `getExpoPushTokenAsync()` (which requires FCM on Android) and registers it with the backend via the `pushTokens.register` tRPC mutation.

### 8.2 Notification Delivery Flow

```
Backend → Expo Push API → Expo Push Service → FCM → Android Device
```

The backend sends notifications to the Expo Push API using the stored Expo Push Token. Expo handles the FCM delivery. No FCM server key is needed on the backend — Expo manages the FCM credentials.

### 8.3 Notification Categories

The app supports 5 notification categories, all enabled by default: appointment reminders, service time alerts, vehicle status updates, promotions and offers, and general notifications. Users can toggle each category independently in the notification settings screen.

### 8.4 FCM Dependency

Android push notifications require a `google-services.json` file from Firebase Console, referenced in `app.json` via `googleServicesFile`. Without this file, `getExpoPushTokenAsync()` returns null and push token registration silently fails. FCM setup is currently pending.

---

## 9. Deployment Architecture

### 9.1 Backend Deployment

The backend runs as a Windows Service managed by NSSM at `C:\QarajGM\Backend\`. It executes `npx tsx backend/hono.ts` via a `service-wrapper.js` entry point. Configuration is loaded from `.env` in the backend root.

**Update procedure:**
1. `cd C:\QarajGM\repo && git pull origin main`
2. `xcopy /E /Y expo\backend\* C:\QarajGM\Backend\backend\`
3. `C:\QarajGM\nssm\nssm-2.24\win64\nssm.exe restart QarajAPI`

**Car images deployment:**
1. `xcopy /E /Y expo\assets\car-images\* C:\QarajGM\Backend\car-images\`

### 9.2 Mobile Build Pipeline

Mobile builds use EAS Build (Expo Application Services) triggered via CLI or GitHub Actions.

| Step | Action |
|------|--------|
| 1 | Work on `develop` branch |
| 2 | When ready: merge `develop` → `main` |
| 3 | Tag release: `git tag -a v1.1.x -m "description"` |
| 4 | Push: `git push origin main --tags` |
| 5 | Build: `eas build --platform android --profile preview --non-interactive` |
| 6 | Distribute APK via EAS build page URL |

**Kill Switch:** The app checks `EXPO_PUBLIC_BUILD_DATE` on launch. If the build is older than 7 days, the app blocks execution and demands an update. This prevents stale test builds from remaining in circulation.

### 9.3 Versioning Strategy

The project uses semantic versioning with sequential Android versionCodes.

| Component | When to Bump | Example |
|-----------|-------------|---------|
| MAJOR (x.0.0) | Breaking changes, full redesign, Play Store launch | 1.0 → 2.0 |
| MINOR (0.x.0) | New features, significant improvements | 1.1 → 1.2 |
| PATCH (0.0.x) | Bug fixes, small tweaks | 1.1.0 → 1.1.1 |
| versionCode | Always increments by 1 | 29, 30, 31... |

### 9.4 Git Branching Strategy

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| `main` | Stable, deployable releases | Permanent |
| `develop` | Default working branch, next release | Permanent |
| `feature/xxx` | Individual features or experiments | Until merged |
| `hotfix/xxx` | Emergency fixes on production | Until merged to main + develop |

---

## 10. Error Handling and Monitoring

### 10.1 Client-Side Error Handling

All API call catch blocks display translated error messages using the i18n system. Network errors are detected via regex pattern matching and show the `auth.networkError` translated message. No silent fallbacks — every error is surfaced to the user with an appropriate message in their language (EN/AZ/RU).

### 10.2 Server-Side Error Handling

Hono middleware catches API errors, formats them as standard JSON responses, and logs them to the console. The monitoring subsystem stores errors in the `error_logs` table with severity levels, stack traces, and device information.

### 10.3 Monitoring Dashboard

A lightweight HTML dashboard at `/monitoring` visualizes the `error_logs` and `bug_reports` tables. It is restricted to admin IPs and provides error triage, bug report management, and system health metrics including database statistics, user counts, and API performance.

---

## 11. External Integrations

### 11.1 Softline SMS Gateway

OTP codes are delivered via Softline's HTTP API at `https://gw.soft-line.az/sendsms`. The registered sender name is "Groupmotors". Authentication uses query parameters (user/password). A mock mode logs OTPs to the server console during development. The current SMS balance is tracked and visible in the API response.

### 11.2 OpenAI API

The AI spare parts advisory uses `gpt-4.1-mini` via direct HTTP POST to `/chat/completions`. System prompts enforce JSON output matching the `SparePartsResponse` schema, localized to the user's language preference. The AI considers vehicle brand, model, year, and VIN for accurate recommendations.

### 11.3 Expo Push Service

Push notifications are delivered via Expo's Push API at `https://exp.host/--/api/v2/push/send`. Expo handles the FCM delivery chain, eliminating the need for FCM server keys on the backend. The backend stores Expo Push Tokens per user and sends notifications using the stored tokens.

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 25, 2026 | Initial TAD — Expo SDK 52, 2 brands |
| 2.0 | April 29, 2026 | Updated to SDK 54, 7 brands, car image architecture, push notification architecture, versioning strategy, branching strategy, cleartext HTTP config, error handling improvements |

---

*This document is maintained in the Qaraj GM project repository and updated with each major architectural change.*
