# Qaraj GM — Business Requirements Document (BRD)

**Version:** 1.0
**Date:** April 25, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Draft — Pre-Production

---

## 1. Executive Summary

Qaraj GM is a mobile-first car service management platform built for **Group Motors**, an authorized Honda and Toyota dealer group in Baku, Azerbaijan. The platform digitizes the customer-facing service experience: vehicle registration, appointment booking, service history tracking, and AI-powered spare parts advisory. It serves as the digital bridge between Group Motors' service centers and their customers.

The system consists of a **React Native mobile application** (Android, with iOS planned) and a **Node.js/Hono backend API** deployed on a dedicated Windows Server in Baku. The backend uses PostgreSQL (via TiDB/Neon) for persistent storage and exposes a type-safe tRPC API consumed by the mobile client.

---

## 2. Business Context

### 2.1 Company Profile

Group Motors operates authorized Honda and Toyota service centers across Baku. The company maintains a fleet of service facilities and employs certified technicians for both brands. Current customer interaction relies on phone calls, WhatsApp messages, and walk-in visits — creating friction, missed appointments, and incomplete service records.

### 2.2 Business Problem

| Problem | Impact |
|---------|--------|
| No centralized digital service record per vehicle | Customers lose track of maintenance history; service advisors lack context |
| Appointment booking via phone/WhatsApp only | High no-show rates, scheduling conflicts, manual coordination overhead |
| No customer self-service portal | Every inquiry requires staff time; customers cannot check status independently |
| Spare parts information scattered | Customers call multiple times asking about parts, pricing, and availability |
| No digital relationship with customers between visits | Zero engagement outside service appointments; no proactive maintenance reminders |

### 2.3 Business Objectives

1. **Digitize the customer service journey** — from vehicle registration to appointment booking to service history review
2. **Reduce operational overhead** — fewer phone calls, fewer scheduling conflicts, automated reminders
3. **Improve customer retention** — proactive maintenance alerts, transparent service history, easy rebooking
4. **Create a data asset** — structured vehicle and service data enables analytics, predictive maintenance, and targeted marketing
5. **Establish a platform for future expansion** — the architecture supports multi-brand, multi-location, and third-party integrations

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

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | User registers/logs in using phone number + SMS OTP | Must Have |
| AUTH-02 | After OTP verification, user sets a 4-digit PIN (bcrypt hashed server-side) | Must Have |
| AUTH-03 | Returning users authenticate via PIN or biometric (fingerprint/face) | Must Have |
| AUTH-04 | JWT token issued after successful auth, valid for 30 days | Must Have |
| AUTH-05 | Session grace period: no auth needed within 1 hour of last use | Must Have |
| AUTH-06 | After 7 days of inactivity, PIN/biometric required | Must Have |
| AUTH-07 | After 30 days, full re-authentication (phone + OTP + PIN) | Must Have |
| AUTH-08 | OTP delivery via Softline SMS gateway (sender: "Qaraj" when registered) | Must Have |
| AUTH-09 | Rate limiting on OTP: 3 requests per minute per phone number | Must Have |
| AUTH-10 | Rate limiting on PIN verification: 10 attempts per minute | Must Have |

### 4.2 Vehicle Management

| ID | Requirement | Priority |
|----|-------------|----------|
| VEH-01 | User can register multiple vehicles (brand, model, year, VIN, license plate, color, mileage) | Must Have |
| VEH-02 | User can upload photos for each vehicle | Must Have |
| VEH-03 | User can set a primary photo per vehicle | Should Have |
| VEH-04 | User can edit vehicle details | Must Have |
| VEH-05 | User can delete a vehicle (cascades to photos, appointments, service records) | Must Have |
| VEH-06 | Vehicles are retrieved by phone number (user identity) | Must Have |
| VEH-07 | VIN is indexed for future cross-referencing with OEM databases | Should Have |

### 4.3 Service Center Directory

| ID | Requirement | Priority |
|----|-------------|----------|
| SC-01 | Display list of Group Motors service centers with name, address, phone, hours, rating | Must Have |
| SC-02 | Each center has a list of available service types | Must Have |
| SC-03 | Centers have GPS coordinates for map integration | Should Have |
| SC-04 | Service center data is seeded/managed server-side (not user-editable) | Must Have |
| SC-05 | Centers include rating and review count (future: user reviews) | Should Have |

### 4.4 Appointment Booking

| ID | Requirement | Priority |
|----|-------------|----------|
| APT-01 | User can book a service appointment selecting: vehicle, service center, service types, date, time, notes | Must Have |
| APT-02 | Appointments are limited to working hours: 9:00 AM – 5:00 PM | Must Have |
| APT-03 | Appointment statuses: pending, confirmed, completed, cancelled | Must Have |
| APT-04 | User can view their appointment history | Must Have |
| APT-05 | User or admin can update appointment status | Must Have |
| APT-06 | Appointments are linked to both user and vehicle | Must Have |

### 4.5 Service Records

| ID | Requirement | Priority |
|----|-------------|----------|
| SR-01 | Each vehicle has a chronological service history | Must Have |
| SR-02 | Service record includes: service name, type, date, mileage, cost, center, technician, parts used, notes | Must Have |
| SR-03 | Service types: maintenance, repair, inspection, other | Must Have |
| SR-04 | Service records are immutable once created (audit trail) | Should Have |
| SR-05 | Historical data display limited to 12 months | Must Have |

### 4.6 AI-Powered Spare Parts Advisory

| ID | Requirement | Priority |
|----|-------------|----------|
| AI-01 | User can search for spare parts using natural language queries | Must Have |
| AI-02 | AI considers vehicle brand, model, year, and VIN for accurate recommendations | Must Have |
| AI-03 | Response includes: part name, OEM part number, category, estimated price (AZN), compatibility, notes | Must Have |
| AI-04 | AI provides maintenance tips alongside parts recommendations | Should Have |
| AI-05 | Multi-language support: English, Azerbaijani, Russian | Must Have |
| AI-06 | Rate limited to 5 requests per minute per user | Must Have |

### 4.7 Push Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| PN-01 | Mobile app registers push token with backend | Must Have |
| PN-02 | Tokens are stored per user, per platform (Android/iOS) | Must Have |
| PN-03 | Future: appointment reminders, service completion alerts, maintenance due notifications | Should Have |

### 4.8 User Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| UP-01 | User profile stores: phone, name, email (optional), avatar, language preference, theme preference | Must Have |
| UP-02 | Supported languages: English, Azerbaijani, Russian | Must Have |
| UP-03 | Supported themes: light, dark | Must Have |
| UP-04 | User can change PIN | Must Have |

---

## 5. Non-Functional Requirements

### 5.1 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-01 | All API endpoints require API key authentication (`x-api-key` header) | Must Have |
| SEC-02 | PIN stored as bcrypt hash — never in plaintext | Must Have |
| SEC-03 | JWT tokens signed with HMAC-SHA256, configurable secret | Must Have |
| SEC-04 | Rate limiting on all endpoints (configurable per procedure) | Must Have |
| SEC-05 | Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy | Must Have |
| SEC-06 | CORS restricted to configured origins | Must Have |
| SEC-07 | Monitoring dashboard protected by IP whitelist | Must Have |
| SEC-08 | No sensitive information stored beyond what is operationally necessary | Must Have |
| SEC-09 | SMS OTP code never returned in API response in production mode | Must Have |

### 5.2 Performance

| ID | Requirement |
|----|-------------|
| PERF-01 | API response time under 500ms for standard CRUD operations |
| PERF-02 | AI spare parts query response under 5 seconds |
| PERF-03 | Support minimum 100 concurrent users |

### 5.3 Availability

| ID | Requirement |
|----|-------------|
| AVAIL-01 | Service auto-restarts on crash (NSSM service wrapper) |
| AVAIL-02 | Health check endpoint at `/` for uptime monitoring |
| AVAIL-03 | Target uptime: 99% during business hours (9 AM – 6 PM Baku time) |

### 5.4 Mobile App

| ID | Requirement |
|----|-------------|
| MOB-01 | Android APK distributed via direct download (GitHub Actions CI/CD) |
| MOB-02 | iOS TestFlight distribution (planned) |
| MOB-03 | Kill switch: APK expires 7 days after build date (testing phase) |
| MOB-04 | Minimum Android version: API 24 (Android 7.0) |
| MOB-05 | Offline-friendly: cached data available when network is unavailable |

---

## 6. Data Model Summary

The system uses 8 primary tables plus 2 monitoring tables:

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
| `error_logs` | Server and client error tracking | Monitoring subsystem |
| `bug_reports` | Team bug reporting | Monitoring subsystem |

---

## 7. User Journeys

### 7.1 New Customer — First Visit

```
Download APK → Open app → Enter phone number → Receive SMS OTP →
Enter OTP → Set 4-digit PIN → Enable biometric (optional) →
Home screen → Add vehicle → Browse service centers →
Book appointment → Receive confirmation
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
| Phase 2 | Push notification reminders (appointment, maintenance due) | Reduce no-shows, increase rebooking |
| Phase 2 | Service center admin panel (web dashboard) | Staff self-service, reduce IT dependency |
| Phase 3 | Payment integration (online deposit for appointments) | Revenue acceleration, commitment |
| Phase 3 | Customer reviews and ratings for service centers | Trust, quality feedback loop |
| Phase 4 | Multi-brand expansion (beyond Honda/Toyota) | Market expansion |
| Phase 4 | OBD-II / connected car integration | Predictive maintenance, premium tier |
| Phase 5 | White-label platform for other dealer groups | SaaS revenue stream |

---

## 9. Constraints and Assumptions

### Constraints

1. Server is a single Windows machine at `91.107.161.67` — no cloud auto-scaling
2. SMS provider (Softline) requires registered sender names per brand
3. Azerbaijan IP firewall restricts access to domestic IPs only
4. No App Store / Play Store distribution yet — APK direct download only
5. GitHub Actions free tier limits CI/CD build minutes

### Assumptions

1. Group Motors will provide updated Softline SMS credentials
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
4. The AI spare parts search returns relevant results for Honda/Toyota vehicles
5. The monitoring dashboard shows error logs and accepts bug reports
6. The API is secured with API key, rate limiting, and security headers
7. The APK installs and runs on Android 7.0+ devices
8. The kill switch blocks expired builds after 7 days

---

*This document is maintained in the Qaraj GM project repository and updated with each major feature release.*
