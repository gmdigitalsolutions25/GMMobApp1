# Qaraj GM — Technical Architecture Document (TAD)

**Version:** 1.0
**Date:** April 25, 2026
**Author:** Manus (AI CTO) for Diamond Motors / Qaraj GM
**Status:** Draft — Pre-Production

---

## 1. System Overview

Qaraj GM is a modern, full-stack mobile application designed for high performance, type safety, and rapid iteration. The architecture follows a client-server model with a React Native mobile frontend communicating with a Node.js backend via a strictly typed tRPC API.

The system is deployed on a single Windows Server instance in Baku, Azerbaijan, with PostgreSQL database hosting provided by Neon (or local TiDB).

---

## 2. Technology Stack

### 2.1 Frontend (Mobile App)
- **Framework:** React Native with Expo (SDK 52)
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **API Client:** tRPC Client (`@trpc/client`, `@trpc/react-query`)
- **State Management:** React Query (via tRPC), Zustand
- **Local Storage:** `expo-secure-store` (for JWT tokens), `AsyncStorage`
- **Authentication:** `expo-local-authentication` (Biometrics)

### 2.2 Backend (API Server)
- **Runtime:** Node.js (v22.13.0)
- **Framework:** Hono (lightweight, edge-ready web framework)
- **API Layer:** tRPC Server (`@trpc/server`, `@hono/trpc-server`)
- **Language:** TypeScript (executed via `tsx`)
- **Validation:** Zod (schema validation for all inputs/outputs)
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon / TiDB)
- **Process Manager:** NSSM (Non-Sucking Service Manager) for Windows

### 2.3 Infrastructure & DevOps
- **Hosting:** Windows Server (IP: `91.107.161.67`)
- **CI/CD:** GitHub Actions (Automated APK/AAB builds)
- **SMS Gateway:** Softline HTTP API
- **AI Integration:** OpenAI API (`gpt-4.1-mini`)

---

## 3. Architecture Diagram

```mermaid
graph TD
    subgraph Mobile Client [Expo React Native App]
        UI[UI Components]
        Router[Expo Router]
        TRPC_Client[tRPC Client]
        SecureStore[(Secure Store)]
        
        UI <--> Router
        Router <--> TRPC_Client
        TRPC_Client <--> SecureStore
    end

    subgraph Windows Server [91.107.161.67]
        NSSM[NSSM Service Manager]
        
        subgraph Node.js Process
            Hono[Hono Web Server]
            Middleware[Security Middleware]
            TRPC_Server[tRPC Router]
            Drizzle[Drizzle ORM]
            
            Hono --> Middleware
            Middleware --> TRPC_Server
            TRPC_Server --> Drizzle
        end
        
        NSSM --> |Manages| Hono
    end

    subgraph External Services
        PostgreSQL[(PostgreSQL DB)]
        Softline[Softline SMS API]
        OpenAI[OpenAI API]
        GitHub[GitHub Actions CI/CD]
    end

    TRPC_Client <==> |HTTP POST /api/trpc/*| Hono
    Drizzle <==> |TCP 5432| PostgreSQL
    TRPC_Server --> |HTTP GET| Softline
    TRPC_Server --> |HTTP POST| OpenAI
    GitHub --> |Builds| Mobile Client
```

---

## 4. Security Architecture

Security is implemented in multiple layers, from the network level down to the application logic.

### 4.1 Network & Infrastructure Level
- **Firewall:** Windows Firewall restricts incoming traffic on port 3000 to Azerbaijani IP ranges only.
- **Monitoring Whitelist:** The `/monitoring` dashboard is restricted to specific admin IPs (e.g., `127.0.0.1`, `91.107.161.67`).

### 4.2 Application Middleware Level
- **API Key:** All mobile app requests must include the `x-api-key` header (`qaraj-dev-key-2026`).
- **Rate Limiting:** In-memory, per-IP rate limiting prevents brute force and abuse.
  - OTP endpoints: 3-5 req/min
  - PIN endpoints: 10 req/min
  - AI endpoints: 5 req/min
  - Standard CRUD: 60 req/min
- **Security Headers:** `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.
- **CORS:** Restricted to allowed origins.

### 4.3 Authentication & Session Level
- **PIN Hashing:** User PINs are hashed using `bcryptjs` before database storage.
- **JWT Sessions:** Successful authentication issues a JSON Web Token (JWT) signed with `HMAC-SHA256`.
- **Token Storage:** The mobile app stores the JWT in the device's encrypted keychain (`expo-secure-store`).
- **Biometric Unlock:** The app uses local device biometrics (FaceID/TouchID) to unlock the stored JWT without hitting the server.

---

## 5. Data Architecture

The database uses PostgreSQL, managed via Drizzle ORM. The schema is defined in TypeScript, providing end-to-end type safety from the database to the mobile UI.

### 5.1 Core Entities

1. **Users (`users`)**
   - Primary key: UUID
   - Unique identifier: `phone` (normalized to 9 digits)
   - Stores preferences (language, theme) and the bcrypt `pinHash`.

2. **Vehicles (`vehicles`)**
   - Belongs to a User (cascade delete).
   - Stores VIN, license plate, brand, model, year.

3. **Appointments (`appointments`)**
   - Links a User, a Vehicle, and a Service Center.
   - Tracks status (`pending`, `confirmed`, `completed`, `cancelled`).

4. **Service Records (`service_records`)**
   - Belongs to a Vehicle.
   - Immutable historical log of work performed, cost, and mileage.

### 5.2 Monitoring Entities

1. **Error Logs (`error_logs`)**
   - Captures both server-side exceptions and client-side React Native crashes.
   - Includes severity, stack trace, and device info.

2. **Bug Reports (`bug_reports`)**
   - User-submitted or tester-submitted issues.
   - Tracks resolution status and assigned personnel.

---

## 6. Deployment Architecture

### 6.1 Backend Deployment
The backend runs as a Windows Service using NSSM.

1. **Location:** `C:\QarajGM\Backend\`
2. **Execution:** `npx tsx backend/hono.ts` (via `service-wrapper.js`)
3. **Environment:** Configuration is loaded from `.env` in the backend root.
4. **Updates:** Manual file copy + service restart (`taskkill /F /IM node.exe`).

### 6.2 Mobile CI/CD Pipeline
Mobile builds are fully automated via GitHub Actions.

1. **Trigger:** Manual dispatch (`workflow_dispatch`) from the GitHub UI.
2. **Process:**
   - Checks out code.
   - Sets up Node.js and Expo.
   - Injects `EXPO_PUBLIC_BUILD_DATE` for the kill switch.
   - Runs `eas build --platform android --profile preview --local`.
3. **Artifacts:** Produces an APK (for testing) or AAB (for Play Store).
4. **Kill Switch:** The app checks `EXPO_PUBLIC_BUILD_DATE` on launch. If the build is older than 7 days, the app blocks execution and demands an update.

---

## 7. External Integrations

### 7.1 Softline SMS Gateway
- **Purpose:** Delivery of OTP codes for user authentication.
- **Protocol:** HTTP GET
- **Endpoint:** `https://gw.soft-line.az/sendsms`
- **Authentication:** Query parameters (`user`, `password`).
- **Fallback:** A "mock" mode logs OTPs to the server console during development.

### 7.2 OpenAI API
- **Purpose:** Natural language spare parts advisory.
- **Model:** `gpt-4.1-mini`
- **Integration:** Direct HTTP POST to `/chat/completions`.
- **Prompt Engineering:** System prompts enforce JSON output matching the `SparePartsResponse` schema, localized to the user's language preference.

---

## 8. Error Handling & Monitoring

1. **Client-Side:** React Native Error Boundaries catch unhandled exceptions and send them to the backend via `monitoring.logClientError`.
2. **Server-Side:** Hono middleware catches API errors, formats them as standard JSON responses, and logs them to the console.
3. **Dashboard:** A lightweight HTML dashboard at `/monitoring` visualizes the `error_logs` and `bug_reports` tables, allowing admins to resolve issues and export JSON reports.

---

*This document is maintained in the Qaraj GM project repository and updated with each major architectural change.*
