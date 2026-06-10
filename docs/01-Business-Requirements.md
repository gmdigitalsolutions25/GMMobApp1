# Qaraj GM — Business Requirements Document (BRD)

**Version:** 3.0
**Date:** June 10, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Active — Pre-Production Testing

---

## 1. Executive Summary

Qaraj GM is a mobile-first car service management platform built for **Group Motors**, an authorized multi-brand dealer group in Baku, Azerbaijan. The platform digitizes the customer-facing service experience: vehicle registration, appointment booking, service history tracking, and AI-powered spare parts advisory. It serves as the digital bridge between Group Motors' service centers and their customers.

Group Motors currently represents **seven automotive brands**: BYD, Ford, Honda, Mazda, Mitsubishi, Subaru, and Toyota, with a combined catalog of 109 vehicle models. The system supports all brands equally through a database-driven brand/model catalog that can be extended without code changes.

The system consists of a **React Native mobile application** (Android, with iOS planned) built on Expo SDK 54, and a **Node.js/Hono backend API** deployed on a dedicated Windows Server in Baku. The backend uses PostgreSQL (via Neon) for persistent storage and exposes a type-safe tRPC API consumed by the mobile client.

---

## 2. Business Context

### 2.1 Company Profile

Group Motors operates authorized service centers for BYD, Ford, Honda, Mazda, Mitsubishi, Subaru, and Toyota across Baku. The company maintains a fleet of service facilities and employs certified technicians for all represented brands. Current customer interaction relies on phone calls, WhatsApp messages, and walk-in visits — creating friction, missed appointments, and incomplete service records.

### 2.2 Business Problem

| Problem | Impact |
|---------|--------|
| No centralized digital service record per vehicle | Customers lose track of maintenance history; service advisors lack context |
| Appointment booking via phone/WhatsApp only | High no-show rates, scheduling conflicts, manual coordination overhead |
| No customer self-service portal | Every inquiry requires staff time; customers cannot check status independently |
| Spare parts information scattered | Customers call multiple times asking about parts, pricing, and availability |
| No digital relationship with customers between visits | Zero engagement outside service appointments; no proactive maintenance reminders |
| Multi-brand complexity | Seven brands with 109 models require a scalable, data-driven approach to vehicle management |

### 2.3 Business Objectives

1. **Digitize the customer service journey** — from vehicle registration to appointment booking to service history review
2. **Reduce operational overhead** — fewer phone calls, fewer scheduling conflicts, automated reminders
3. **Improve customer retention** — proactive maintenance alerts, transparent service history, easy rebooking
4. **Create a data asset** — structured vehicle and service data enables analytics, predictive maintenance, and targeted marketing
5. **Establish a platform for future expansion** — the architecture supports multi-brand, multi-location, and third-party integrations
6. **Enable targeted marketing** — push notifications for promotions, new model announcements, and seasonal campaigns

---

## 3. Stakeholders

| Stakeholder | Role | Primary Interest |
|-------------|------|-----------------|
| Elnur Hasanov | Project Owner / CTO | Strategic direction, technology decisions, business viability |
| Group Motors Management | Business Sponsor | Customer satisfaction, operational efficiency, revenue |
| Service Center Managers | Operations | Appointment flow, technician scheduling, parts ordering |
| Service Advisors | End Users (Staff) | Customer vehicle info, service history, appointment management |
| Customers | End Users (Mobile) | Easy booking, service tracking, transparent pricing |
| Technicians | Internal Users | Work order details, vehicle history, parts requirements |

---

## 4. Functional Requirements

### 4.1 User Authentication and Identity

The phone number is the **primary identity key** for all users. No email or username is required.

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AUTH-01 | User registers/logs in using phone number + SMS OTP | Must Have | Implemented |
| AUTH-02 | After OTP verification, user sets a 4-digit PIN (bcrypt hashed server-side) | Must Have | Implemented |
| AUTH-03 | Returning users authenticate via PIN or biometric (fingerprint/face) | Must Have | Implemented |
| AUTH-04 | JWT token issued after successful auth, valid for 30 days | Must Have | Implemented |
| AUTH-05 | Session grace period: no auth needed within 1 hour of last use | Must Have | Implemented |
| AUTH-06 | After 7 days of inactivity, PIN/biometric required | Must Have | Implemented |
| AUTH-07 | After 30 days, full re-authentication (phone + OTP + PIN) | Must Have | Implemented |
| AUTH-08 | OTP delivery via Softline SMS gateway (sender: "Groupmotors") | Must Have | Implemented |
| AUTH-09 | Rate limiting on OTP: 3 requests per minute per phone number | Must Have | Implemented |
| AUTH-10 | Rate limiting on PIN verification: 10 attempts per minute | Must Have | Implemented |
| AUTH-11 | Proper error handling with translated messages (EN/AZ/RU) for network and auth failures | Must Have | Implemented |
| AUTH-12 | Version number displayed on all auth screens (welcome, OTP, PIN) | Should Have | Implemented |

### 4.2 Vehicle Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| VEH-01 | User can register multiple vehicles (brand, model, year, VIN, license plate, color, mileage) | Must Have | Implemented |
| VEH-02 | User can upload photos for each vehicle or select from brand library | Must Have | Implemented |
| VEH-03 | User can set a primary photo per vehicle | Should Have | Implemented |
| VEH-04 | User can edit vehicle details | Must Have | Implemented |
| VEH-05 | User can delete a vehicle (cascades to photos, appointments, service records) | Must Have | Implemented |
| VEH-06 | Vehicles are retrieved by phone number (user identity) | Must Have | Implemented |
| VEH-12 | Vehicles are synced from CRM/DWH (`clientdata.vehicles`) automatically | Must Have | Implemented |
| VEH-13 | Users can submit a "Find My Vehicle" request if their car is missing | Must Have | Implemented |
| VEH-07 | VIN is indexed for future cross-referencing with OEM databases | Should Have | Implemented |
| VEH-08 | VIN validation: 17 alphanumeric characters, no I/O/Q | Must Have | Implemented |
| VEH-09 | License plate format enforcement: Azerbaijan NN-CC-NNN pattern | Must Have | Implemented |
| VEH-10 | Brand/model catalog loaded from PostgreSQL (109 models across 7 brands) | Must Have | Implemented |
| VEH-11 | Car model library images: 800px WebP, served from backend, cached 30 days on device | Should Have | Implemented |

### 4.3 Service Center Directory

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SC-01 | Display list of Group Motors service centers with name, address, phone, hours, rating | Must Have | Implemented |
| SC-02 | Each center has a list of available service types | Must Have | Implemented |
| SC-03 | Centers have GPS coordinates for map integration | Should Have | Implemented |
| SC-04 | Service center data is seeded/managed server-side (not user-editable) | Must Have | Implemented |
| SC-05 | Centers include rating and review count (future: user reviews) | Should Have | Implemented |

### 4.4 Appointment Booking

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| APT-01 | User can book a service appointment selecting: vehicle, service center, service types, date, time, notes | Must Have | Implemented |
| APT-02 | Appointments are limited to working hours: 9:00 AM – 5:00 PM | Must Have | Implemented |
| APT-03 | Appointment statuses: pending, confirmed, completed, cancelled | Must Have | Implemented |
| APT-07 | Appointments show "Pending Approval" (max 1h SLA) after booking | Must Have | Implemented |
| APT-04 | User can view their appointment history | Must Have | Implemented |
| APT-05 | User or admin can update appointment status | Must Have | Implemented |
| APT-06 | Appointments are linked to both user and vehicle | Must Have | Implemented |

### 4.5 Service Records

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SR-01 | Each vehicle has a chronological service history | Must Have | Implemented |
| SR-02 | Service record includes: service name, type, date, mileage, cost, center, technician, parts used, notes | Must Have | Implemented |
| SR-03 | Service types: maintenance, repair, inspection, other | Must Have | Implemented |
| SR-04 | Service records are immutable once created (audit trail) | Should Have | Implemented |
| SR-05 | Historical data display limited to 12 months | Must Have | Implemented |

### 4.6 AI-Powered Spare Parts Advisory

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AI-01 | User can search for spare parts using natural language queries | Must Have | Implemented |
| AI-02 | AI considers vehicle brand, model, year, and VIN for accurate recommendations | Must Have | Implemented |
| AI-03 | Response includes: part name, OEM part number, category, estimated price (AZN), compatibility, notes | Must Have | Implemented |
| AI-04 | AI provides maintenance tips alongside parts recommendations | Should Have | Implemented |
| AI-05 | Multi-language support: English, Azerbaijani, Russian | Must Have | Implemented |
| AI-06 | Rate limited to 5 requests per minute per user | Must Have | Implemented |

### 4.7 Push Notifications

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| PN-01 | Mobile app registers Expo Push Token with backend via tRPC | Must Have | In Progress |
| PN-02 | Tokens are stored per user, per platform (Android/iOS) | Must Have | Implemented |
| PN-03 | Admin can send targeted push notifications by phone number | Must Have | Implemented |
| PN-04 | Notification categories: appointments, service alerts, vehicle updates, promotions, general | Must Have | Implemented |
| PN-05 | User can toggle notification categories on/off in settings | Must Have | Implemented |
| PN-06 | All notification categories enabled by default | Must Have | Implemented |
| PN-07 | Firebase Cloud Messaging (FCM) required for Android delivery | Must Have | Pending Setup |
| PN-08 | Appointment reminders, service completion alerts, maintenance due notifications | Should Have | Planned |

### 4.8 User Profile

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| UP-01 | User profile stores: phone, name, email (optional), avatar, language preference, theme preference | Must Have | Implemented |
| UP-02 | Supported languages: English, Azerbaijani, Russian | Must Have | Implemented |
| UP-03 | Supported themes: light, dark | Must Have | Implemented |
| UP-04 | User can change PIN | Must Have | Implemented |
| UP-05 | Profile page shows current app version | Must Have | Implemented |
| UP-06 | Profile hydration from server on login (sync local state with DB) | Must Have | Implemented |
| UP-07 | Strict onboarding gate: users without a first name are forced to onboarding | Must Have | Implemented |

---

## 5. Non-Functional Requirements

### 5.1 Security

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| SEC-01 | All API endpoints require API key authentication (`x-api-key` header) | Must Have | Implemented |
| SEC-02 | PIN stored as bcrypt hash — never in plaintext | Must Have | Implemented |
| SEC-03 | JWT tokens signed with HMAC-SHA256, configurable secret | Must Have | Implemented |
| SEC-04 | Rate limiting on all endpoints (configurable per procedure) | Must Have | Implemented |
| SEC-05 | Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy | Must Have | Implemented |
| SEC-06 | CORS restricted to configured origins | Must Have | Implemented |
| SEC-07 | Monitoring dashboard protected by IP whitelist | Must Have | Implemented |
| SEC-08 | No sensitive information stored beyond what is operationally necessary | Must Have | Implemented |
| SEC-09 | SMS OTP code never returned in API response in production mode | Must Have | Implemented |

### 5.2 Performance

| ID | Requirement |
|----|-------------|
| PERF-01 | API response time under 500ms for standard CRUD operations |
| PERF-02 | AI spare parts query response under 5 seconds |
| PERF-03 | Support minimum 100 concurrent users |
| PERF-04 | Car model images cached on device for 30 days to minimize bandwidth |

### 5.3 Availability

| ID | Requirement |
|----|-------------|
| AVAIL-01 | Service auto-restarts on crash (NSSM service wrapper) |
| AVAIL-02 | Health check endpoint at `/` for uptime monitoring |
| AVAIL-03 | Target uptime: 99% during business hours (9 AM – 6 PM Baku time) |

### 5.4 Mobile App

| ID | Requirement |
|----|-------------|
| MOB-01 | Android APK distributed via EAS Build (Expo Application Services) |
| MOB-02 | iOS TestFlight distribution (planned) |
| MOB-03 | Kill switch: APK expires 7 days after build date (testing phase) | Must Have | Removed |d version: API 24 (Android 7.0) |
| MOB-05 | Offline-friendly: cached data available when network is unavailable |
| MOB-06 | Semantic versioning: MAJOR.MINOR.PATCH with sequential versionCode |

---

## 6. Data Model Summary

The system uses 10 primary tables plus 2 monitoring tables:

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | Customer identity and preferences | Phone (unique index) |
| `vehicles` | Registered vehicles | → users (cascade delete) |
| `vehicle_photos` | Vehicle images | → vehicles (cascade delete) |
| `service_centers` | Group Motors locations | Standalone reference data |
| `appointments` | Service bookings | → users, → vehicles, → service_centers |
| `service_records` | Completed service history | → vehicles |
| `otp_codes` | SMS verification codes | Phone indexed |
| `push_tokens` | Mobile notification tokens | → users |
| `brands` | Automotive brand catalog | Standalone reference data |
| `models` | Vehicle model catalog | → brands |
| `error_logs` | Server and client error tracking | Monitoring subsystem |
| `bug_reports` | Team bug reporting | Monitoring subsystem |

---

## 7. User Journeys

### 7.1 New Customer — First Visit

```
Download APK → Open app → See version on welcome screen →
Enter phone number → Receive SMS OTP from "Groupmotors" →
Enter OTP → Set 4-digit PIN → Allow push notifications →
Enable biometric (optional) → Home screen →
Add vehicle (select brand/model from 109 options, choose library image) →
Browse service centers → Book appointment → Receive confirmation
```

### 7.2 Returning Customer — Quick Booking

```
Open app → Biometric/PIN unlock (if > 1 hour) →
Home screen → Select vehicle → Book appointment →
View appointment history
```

### 7.3 Service Advisor — Check Customer History

```
Customer arrives → Advisor looks up phone number →
View all vehicles → View service history per vehicle →
Create new service record after work is done
```

---

## 8. Future Roadmap

| Phase | Feature | Business Value |
|-------|---------|---------------|
| Phase 1.5 | FCM setup + push notification delivery | Enable marketing and service reminders |
| Phase 2 | Push notification reminders (appointment, maintenance due) | Reduce no-shows, increase rebooking |
| Phase 2 | Service center admin panel (web dashboard) | Staff self-service, reduce IT dependency |
| Phase 2 | HTTPS migration for API server | Security, Play Store compliance |
| Phase 3 | Payment integration (online deposit for appointments) | Revenue acceleration, commitment |
| Phase 3 | Customer reviews and ratings for service centers | Trust, quality feedback loop |
| Phase 4 | Multi-brand expansion (beyond current 7 brands) | Market expansion |
| Phase 4 | OBD-II / connected car integration | Predictive maintenance, premium tier |
| Phase 5 | White-label platform for other dealer groups | SaaS revenue stream |

---

## 9. Constraints and Assumptions

### Constraints

1. Server is a single Windows machine at `91.107.161.67` — no cloud auto-scaling
2. SMS provider (Softline) requires registered sender names per brand; currently registered as "Groupmotors"
3. API uses HTTP (not HTTPS) — requires `usesCleartextTraffic` on Android; HTTPS migration planned
4. No App Store / Play Store distribution yet — APK via EAS Build direct download only
5. Firebase/FCM setup pending for push notification delivery on Android

### Assumptions

1. Group Motors will provide Firebase project access for FCM configuration
2. Service center data is managed manually (no integration with DMS yet)
3. Initial user base is limited to Group Motors customers and internal testers
4. Internet connectivity is available at all service center locations
5. Customers have Android smartphones with internet access

---

## 10. Acceptance Criteria (MVP)

The minimum viable product is accepted when:

1. A new customer can register via phone + OTP + PIN and add a vehicle
2. A customer can book an appointment at a Group Motors service center
3. A customer can view their appointment and service history
4. The AI spare parts search returns relevant results for all 7 brand vehicles
5. The monitoring dashboard shows error logs and accepts bug reports
6. The API is secured with API key, rate limiting, and security headers
7. The APK installs and runs on Android 7.0+ devices
8. Push notifications are delivered to registered devices
9. Car model images load correctly for all 109 models
10. The onboarding gate strictly prevents access without a completed profile

---

## 11. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 25, 2026 | Initial BRD — Honda and Toyota focus |
| 2.0 | April 29, 2026 | Updated to 7 brands (109 models), added push notification requirements, car image hosting, versioning, error handling, FCM dependency |
| 3.0 | June 10, 2026 | Updated to v1.3.70: added DWH vehicle sync, Find My Vehicle flow, pending approval appointments, strict onboarding gate, removed kill switch |

---

*This document is maintained in the Qaraj GM project repository and updated with each major feature release.*
