# Qaraj GM — Service Desk Dashboard Specification

**Version:** 2.0
**Date:** April 29, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Draft — Phase 2 Planning

---

## 1. Overview

The Service Desk Dashboard is a planned web-based administrative interface for Group Motors staff. While the mobile app serves customers, the Service Desk serves the internal team: Service Advisors, Call Center Agents, and System Administrators.

The current system already provides a basic monitoring dashboard at `/monitoring` (Phase 1), and the backend API includes all the data endpoints needed for a full admin panel. This document outlines the requirements, use cases, and technical approach for building the comprehensive dashboard in Phase 2.

---

## 2. Target Audience and Roles

| Role | Primary Needs | Access Level |
|------|--------------|--------------|
| **Service Advisor** | View customer history, manage appointments, update service records | Operational |
| **Call Center Agent** | Look up customer by phone, assist with booking, answer parts queries | Read-Only / Booking |
| **System Admin** | Monitor system health, manage service center data, view error logs, send push notifications | Full Admin |
| **Marketing Manager** | Send targeted push notifications, view user engagement metrics | Marketing |

---

## 3. Core Modules and Use Cases

### 3.1 Customer 360-Degree View

The core of the dashboard is the ability to look up any customer by their phone number and see their entire relationship with Group Motors.

**Use Cases:**

The agent enters a phone number (e.g., `994501234567`) and instantly sees the customer profile, including all registered vehicles with VINs and primary photos, a chronological timeline of all past services across all vehicles, active and upcoming appointments with their statuses, and the customer's notification preferences and push token status.

**Available API:** `users.getFullProfile` already returns all of this data in a single call.

### 3.2 Appointment Management

A calendar and list view of all service appointments across all centers.

**Use Cases:**

The Service Manager views today's expected arrivals in a daily schedule view. Advisors mark appointments as "Arrived", "In Progress", or "Completed" using status update buttons. Call Center Agents book appointments on behalf of customers who call in, selecting the vehicle, service center, service types, and time slot. Rescheduling is supported via a drag-and-drop calendar interface.

**Available API:** `appointments.list`, `appointments.book`, `appointments.updateStatus`, `appointments.cancel`.

### 3.3 Service Record Entry

The interface for technicians or advisors to log completed work.

**Use Cases:**

Advisors input mileage, service type, parts used, and total cost after service completion. Once saved, records cannot be altered (only appended with notes) to maintain an accurate audit trail. Saving a record instantly makes it visible in the customer's mobile app.

**Available API:** `serviceRecords.create`, `serviceRecords.listByVehicle`.

### 3.4 Push Notification Management

A new module for sending targeted push notifications to customers.

**Use Cases:**

The Marketing Manager sends promotional notifications about new BYD models to all users, or targets specific users by phone number. The System Admin sends service reminders to customers with upcoming appointments. Notification delivery status is tracked via Expo Push receipts.

**Available API:** `pushTokens.send` (already implemented, supports sending by phone number).

### 3.5 System Health and Monitoring

An expanded version of the current `/monitoring` endpoint, designed for the IT/Admin team.

**Use Cases:**

The IT team triages client-side crashes and server-side exceptions via the error log viewer. Bug reports submitted by testers are reviewed and assigned. API metrics including rate limit hits, OpenAI API usage, and SMS gateway delivery rates are monitored. Database health metrics show total users, active sessions, and storage usage.

**Available API:** `monitoring.errors.list`, `monitoring.bugs.list`, `monitoring.health.summary`, `monitoring.health.live`.

---

## 4. Technical Implementation Plan

### 4.1 Technology Stack

To maintain consistency with the React Native mobile app, the Service Desk will be built using:

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js (React) or Vite + React (SPA) | Shared React ecosystem with mobile app |
| Styling | Tailwind CSS + shadcn/ui components | Rapid UI development, consistent design |
| API Client | tRPC Client | Shares exact same types as mobile app |
| Authentication | JWT-based with RBAC | Role-based access control for staff |
| Charts | Chart.js or Recharts | Monitoring visualizations |

### 4.2 API Extensions Required

Most data endpoints already exist. The following new endpoints are needed:

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `admin.searchCustomers` | Search by phone, name, or VIN | Must Have |
| `admin.getCustomer360` | Aggregated view (extends `getFullProfile`) | Must Have |
| `admin.updateAppointmentStatus` | Batch status updates | Should Have |
| `admin.createServiceRecord` | Staff-created service records | Must Have |
| `admin.getSystemMetrics` | Extended metrics beyond current health endpoint | Should Have |
| `admin.listPushTokens` | View all registered push tokens | Should Have |
| `admin.sendBulkNotification` | Send to multiple users at once | Should Have |

### 4.3 Security Considerations

The dashboard should be hosted on a separate subdomain (e.g., `admin.qaraj.az`) or port. Access should be restricted to Group Motors corporate IP addresses and VPNs. Strict role checks must be applied on every `admin.*` tRPC route. Every action taken by an admin (e.g., updating a record, sending a notification) must be logged with their ID and timestamp in an audit trail.

---

## 5. MVP Rollout Strategy

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Basic HTML monitoring dashboard at `/monitoring` for IT use only | **Deployed** |
| Phase 1.5 | Push notification sending via `pushTokens.send` API (CLI/Postman) | **Deployed** |
| Phase 2 | Read-only Customer 360-degree view for Call Center Agents | Planned |
| Phase 3 | Read/Write access for Service Advisors (appointments + records) | Planned |
| Phase 4 | Marketing module (bulk push notifications, campaign tracking) | Planned |

---

## 6. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 25, 2026 | Initial specification |
| 2.0 | April 29, 2026 | Added push notification management module, updated available APIs, added marketing manager role, updated rollout phases |

---

*This document is maintained in the Qaraj GM project repository and updated as the Service Desk requirements evolve.*
