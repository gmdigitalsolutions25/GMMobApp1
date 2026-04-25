# Qaraj GM — Service Desk Dashboard Specification

**Version:** 1.0
**Date:** April 25, 2026
**Author:** Manus (AI CTO) for Diamond Motors / Qaraj GM
**Status:** Draft — Pre-Production

---

## 1. Overview

The Service Desk Dashboard is a planned web-based administrative interface for Diamond Motors staff. While the mobile app serves customers, the Service Desk serves the internal team: Service Advisors, Call Center Agents, and System Administrators.

This document outlines the requirements, use cases, and technical approach for building this dashboard in Phase 2.

---

## 2. Target Audience & Roles

| Role | Primary Needs | Access Level |
|------|--------------|--------------|
| **Service Advisor** | View customer history, manage appointments, update service records | Operational |
| **Call Center Agent** | Look up customer by phone, assist with booking, answer parts queries | Read-Only / Booking |
| **System Admin** | Monitor system health, manage service center data, view error logs | Full Admin |

---

## 3. Core Modules & Use Cases

### 3.1 Customer 360° View
The core of the dashboard is the ability to look up any customer by their phone number and see their entire relationship with Diamond Motors.

**Use Cases:**
- **Search:** Agent enters `+994501234567` and instantly sees the customer profile.
- **Vehicle Fleet:** View all vehicles registered to this customer, including VINs and primary photos.
- **Service History:** View a chronological timeline of all past services across all vehicles.
- **Active Appointments:** See upcoming bookings and their status.

### 3.2 Appointment Management
A calendar and list view of all service appointments across all centers.

**Use Cases:**
- **Daily Schedule:** Service Manager views today's expected arrivals.
- **Status Updates:** Advisor marks an appointment as "Arrived", "In Progress", or "Completed".
- **Manual Booking:** Call Center Agent books an appointment on behalf of a customer who called in.
- **Rescheduling:** Drag-and-drop calendar interface to move appointments.

### 3.3 Service Record Entry
The interface for technicians or advisors to log completed work.

**Use Cases:**
- **Data Entry:** Input mileage, service type, parts used, and total cost.
- **Immutability:** Once saved, records cannot be altered (only appended with notes) to maintain an accurate audit trail.
- **Customer Visibility:** Saving a record instantly makes it visible in the customer's mobile app.

### 3.4 System Health & Monitoring
An expanded version of the current `/monitoring` endpoint, designed for the IT/Admin team.

**Use Cases:**
- **Error Triage:** View client-side crashes and server-side exceptions.
- **Bug Reports:** Review and assign user-submitted bug reports.
- **API Metrics:** Monitor rate limit hits, OpenAI API usage (for spare parts), and SMS gateway delivery rates.
- **Database Health:** View total users, active sessions, and storage metrics.

---

## 4. Technical Implementation Plan

### 4.1 Technology Stack
To maintain consistency with the React Native mobile app, the Service Desk will be built using:

- **Framework:** Next.js (React) or Vite + React (SPA)
- **Styling:** Tailwind CSS + shadcn/ui components
- **API Client:** tRPC Client (sharing the exact same types as the mobile app)
- **Authentication:** JWT-based, with role-based access control (RBAC)

### 4.2 API Extensions Required
The current backend API will need new endpoints to support the dashboard:

1. `admin.searchCustomers` (by phone, name, or VIN)
2. `admin.getCustomer360` (aggregated view of user + vehicles + appointments)
3. `admin.updateAppointmentStatus`
4. `admin.createServiceRecord`
5. `admin.getSystemMetrics`

### 4.3 Security Considerations
- **Network:** The dashboard should be hosted on a separate subdomain (e.g., `admin.qaraj.az`) or port.
- **IP Whitelisting:** Access restricted to Diamond Motors corporate IP addresses and VPNs.
- **RBAC:** Strict role checks on every `admin.*` tRPC route.
- **Audit Logging:** Every action taken by an admin (e.g., updating a record) must be logged with their ID and timestamp.

---

## 5. MVP Rollout Strategy

1. **Phase 1 (Current):** Basic HTML monitoring dashboard at `/monitoring` for IT use only.
2. **Phase 2 (MVP Dashboard):** Read-only Customer 360° view for Call Center Agents.
3. **Phase 3 (Full Dashboard):** Read/Write access for Service Advisors to manage appointments and records.

---

*This document is maintained in the Qaraj GM project repository and updated as the Service Desk requirements evolve.*
