# Qaraj GM — API Reference Document

**Version:** 3.0
**Date:** June 10, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Active — Pre-Production Testing

---

## 1. Overview

The Qaraj GM backend exposes a strictly typed tRPC API. All endpoints are accessible via HTTP POST (for mutations) or GET (for queries) at the base URL:

**Base URL:** `http://91.107.161.67:3000/api/trpc`

In addition to the tRPC API, the server provides static file endpoints for car model images and an HTML monitoring dashboard.

### 1.1 Authentication

All requests must include the API key in the headers:

```
x-api-key: qaraj-dev-key-2026
```

Endpoints that require user authentication must also include a JWT token:

```
Authorization: Bearer <token>
```

### 1.2 Rate Limiting

The API enforces rate limits per IP address:

| Endpoint Category | Rate Limit |
|-------------------|-----------|
| OTP Endpoints | 3 requests per minute |
| PIN Endpoints | 10 requests per minute |
| AI Endpoints | 5 requests per minute |
| Push Token Registration | 5 requests per minute |
| Standard Endpoints | 60 requests per minute |

### 1.3 Response Format

All tRPC responses follow the standard tRPC envelope format:

```json
{
  "result": {
    "data": {
      "json": { ... }
    }
  }
}
```

Error responses include a tRPC error code and message.

---

## 2. Authentication Endpoints (`auth.*`)

### 2.1 `auth.sendOtp` (Mutation)

Sends a 6-digit OTP via SMS to the provided phone number using the Softline gateway (sender: "Groupmotors").

**Input:**
```json
{
  "phone": "994501234567"
}
```

**Output:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Notes:** In development mode with `SMS_MOCK=true`, the OTP is logged to the server console instead of sending an SMS. The `devCode` field is never returned in production.

### 2.2 `auth.verifyOtp` (Mutation)

Verifies the OTP code entered by the user.

**Input:**
```json
{
  "phone": "994501234567",
  "code": "123456"
}
```

**Output:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "hasPin": false,
  "userId": null
}
```

The `hasPin` field indicates whether the user has already set a PIN (returning user). If `true`, the client should proceed to PIN verification. If `false`, the client should proceed to PIN setup.

### 2.3 `auth.setPin` (Mutation)

Sets a new PIN for a user (after OTP verification) and returns a JWT session token. Creates the user record if it does not exist.

**Input:**
```json
{
  "phone": "994501234567",
  "pin": "1234",
  "name": "Elnur Hasanov"
}
```

**Output:**
```json
{
  "success": true,
  "message": "PIN set successfully",
  "token": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "phone": "994501234567",
    "username": "994501234567",
    "language": "en",
    "theme": "dark"
  }
}
```

### 2.4 `auth.verifyPin` (Mutation)

Verifies an existing user's PIN and returns a JWT session token.

**Input:**
```json
{
  "phone": "994501234567",
  "pin": "1234"
}
```

**Output:**
```json
{
  "success": true,
  "message": "PIN verified successfully",
  "token": "eyJhbGci...",
  "user": { ... }
}
```

### 2.5 `auth.resetPin` (Mutation)

Resets a user's PIN after OTP re-verification.

**Input:**
```json
{
  "phone": "994501234567",
  "newPin": "5678"
}
```

**Output:**
```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

### 2.6 `auth.refreshToken` (Mutation)

Renews an existing valid JWT token.

**Input:**
```json
{
  "token": "eyJhbGci..."
}
```

**Output:**
```json
{
  "success": true,
  "token": "eyJhbGci..."
}
```

---

## 3. User Endpoints (`users.*`)

### 3.1 `users.getFullProfile` (Query)

Retrieves the complete user profile including all vehicles, appointments, and service records.

**Input:**
```json
{
  "phone": "994501234567"
}
```

**Output:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "994501234567",
    "name": "Elnur Hasanov",
    "language": "az",
    "theme": "dark"
  },
  "vehicles": [ ... ],
  "appointments": [ ... ],
  "serviceRecords": [ ... ]
}
```

**Notes:** Returns `{ user: null }` if the phone number is not registered. Used for profile hydration after login.

### 3.2 `users.getByPhone` (Query)

Retrieves a user by phone number (admin use).

**Input:**
```json
{
  "phone": "994501234567"
}
```

**Output:**
```json
{
  "user": {
    "id": "uuid",
    "phone": "994501234567",
    "name": "Elnur Hasanov"
  }
}
```

---

## 4. Vehicle Endpoints (`vehicles.*`)

*Requires JWT Authentication*

### 4.1 `vehicles.list` (Query)

Lists all vehicles registered to the authenticated user.

**Input:** None

**Output:**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2022,
      "vin": "JT1BF22K1Y0123456",
      "licensePlate": "99-AA-123",
      "color": "White",
      "mileage": 45000,
      "primaryPhotoUrl": "https..."
    }
  ]
}
```

### 4.2 `vehicles.add` (Mutation)

Registers a new vehicle. VIN must be exactly 17 alphanumeric characters (no I, O, or Q). License plate must follow Azerbaijan NN-CC-NNN format.

**Input:**
```json
{
  "brand": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "JT1BF22K1Y0123456",
  "licensePlate": "99-AA-123",
  "color": "White",
  "mileage": 45000
}
```

**Output:**
```json
{
  "success": true,
  "id": "uuid"
}
```

### 4.3 `vehicles.update` (Mutation)

Updates an existing vehicle's details.

**Input:**
```json
{
  "id": "uuid",
  "mileage": 46000
}
```

**Output:**
```json
{
  "success": true
}
```

### 4.4 `vehicles.delete` (Mutation)

Deletes a vehicle and all associated photos, appointments, and service records (cascade delete).

**Input:**
```json
{
  "id": "uuid"
}
```

**Output:**
```json
{
  "success": true
}
```

---

## 5. DWH and Vehicle Requests Endpoints

### 5.1 `dwh.syncVehicles` (Mutation)

Syncs vehicles from the CRM/DWH (`clientdata.vehicles`) to the app database (`public.vehicles`) for a specific user.

**Input:**
```json
{
  "phone": "994501234567"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Synced 2 vehicles",
  "count": 2
}
```

### 5.2 `vehicleRequests.create` (Mutation)

Submits a "Find My Vehicle" request for users who cannot find their vehicle in the app.

**Input:**
```json
{
  "phone": "994501234567",
  "customerName": "Elnur Hasanov",
  "message": "My 2024 Camry is missing"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Request submitted successfully"
}
```

---

## 6. Brands and Models Endpoints (`brandsModels.*`)

### 5.1 `brandsModels.list` (Query)

Returns all brands and their models from the database. Used to populate the vehicle registration form.

**Input:** None

**Output:**
```json
[
  {
    "value": "Toyota",
    "label": "Toyota",
    "logoUrl": null,
    "models": [
      { "value": "Camry", "label": "Camry" },
      { "value": "Corolla", "label": "Corolla" },
      ...
    ]
  },
  ...
]
```

**Current data:** 7 brands, 109 models total (BYD: 14, Ford: 21, Honda: 12, Mazda: 15, Mitsubishi: 13, Subaru: 10, Toyota: 24).

### 5.2 `brandsModels.byBrand` (Query)

Returns models for a specific brand.

**Input:**
```json
{
  "brand": "Toyota"
}
```

**Output:**
```json
{
  "models": [
    { "value": "Camry", "label": "Camry" },
    { "value": "Corolla", "label": "Corolla" },
    ...
  ]
}
```

---

## 7. Appointment Endpoints (`appointments.*`)

*Requires JWT Authentication*

### 6.1 `appointments.list` (Query)

Lists all appointments for the authenticated user.

**Input:** None

**Output:**
```json
{
  "appointments": [
    {
      "id": "uuid",
      "vehicleId": "uuid",
      "serviceCenterId": "uuid",
      "scheduledDate": "2026-05-01T10:00:00Z",
      "status": "confirmed",
      "serviceTypes": ["oil_change", "inspection"],
      "notes": "Check brakes"
    }
  ]
}
```

### 6.2 `appointments.book` (Mutation)

Books a new service appointment. Appointments are limited to working hours (9:00 AM – 5:00 PM).

**Input:**
```json
{
  "vehicleId": "uuid",
  "serviceCenterId": "uuid",
  "scheduledDate": "2026-05-01T10:00:00Z",
  "serviceTypes": ["oil_change"],
  "notes": "Check brakes"
}
```

**Output:**
```json
{
  "success": true,
  "id": "uuid"
}
```

### 6.3 `appointments.updateStatus` (Mutation)

Updates the status of an appointment.

**Input:**
```json
{
  "id": "uuid",
  "status": "completed"
}
```

**Output:**
```json
{
  "success": true
}
```

### 6.4 `appointments.cancel` (Mutation)

Cancels an existing appointment.

**Input:**
```json
{
  "id": "uuid",
  "reason": "Schedule conflict"
}
```

**Output:**
```json
{
  "success": true
}
```

---

## 8. Service Center Endpoints (`serviceCenters.*`)

### 7.1 `serviceCenters.list` (Query)

Lists all available Group Motors service centers.

**Input:** None

**Output:**
```json
{
  "centers": [
    {
      "id": "uuid",
      "name": "Group Motors - Baku Main",
      "address": "123 Heydar Aliyev Ave",
      "phone": "+994123456789",
      "latitude": 40.4093,
      "longitude": 49.8671,
      "rating": 4.8,
      "reviewCount": 156,
      "servicesOffered": ["maintenance", "repair", "body_shop"]
    }
  ]
}
```

---

## 9. AI Endpoints (`spareParts.*`)

### 8.1 `spareParts.search` (Mutation)

Queries the OpenAI-powered spare parts advisor. Uses `gpt-4.1-mini` with structured prompts that enforce JSON output.

**Input:**
```json
{
  "query": "brake pads",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2022,
  "vin": "JT1BF22K1Y0123456",
  "language": "en"
}
```

**Output:**
```json
{
  "success": true,
  "result": {
    "parts": [
      {
        "name": "Front Brake Pads",
        "partNumber": "04465-06100",
        "category": "Brakes",
        "estimatedPrice": "85-120 AZN",
        "compatibility": "Toyota Camry 2018-2024",
        "notes": "OEM recommended"
      }
    ],
    "summary": "Front brake pads for 2022 Toyota Camry.",
    "maintenanceTips": ["Check brake fluid level when replacing pads."]
  }
}
```

---

## 10. Push Token Endpoints (`pushTokens.*`)

### 10.1 `pushTokens.register` (Mutation)

Registers an Expo Push Token for a user's device. Called automatically after successful authentication.

**Input:**
```json
{
  "phone": "994501234567",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```

**Output:**
```json
{
  "success": true,
  "message": "Push token registered"
}
```

**Notes:** If a token already exists for the same phone + platform combination, it is updated (upsert behavior).

### 10.2 `pushTokens.send` (Mutation)

Sends a push notification to a specific user by phone number. Admin endpoint.

**Input:**
```json
{
  "phone": "994501234567",
  "title": "Service Reminder",
  "body": "Your Toyota Camry is due for service in 3 days.",
  "data": {
    "type": "service_reminder",
    "vehicleId": "uuid"
  }
}
```

**Output:**
```json
{
  "success": true,
  "message": "Notification sent to 1 device(s)",
  "tickets": [ ... ]
}
```

**Notes:** Requires `x-api-key` header. Sends to all active push tokens for the specified phone number. Uses the Expo Push API for delivery.

### 10.3 `pushTokens.delete` (Mutation)

Deletes a push token for a user's device (e.g., on logout).

**Input:**
```json
{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Output:**
```json
{
  "success": true
}
```

---

## 11. Monitoring Endpoints (`monitoring.*`)

### 11.1 Error Tracking

**`monitoring.errors.list` (Query)** — Lists all error logs, sorted by most recent.

**`monitoring.errors.create` (Mutation)** — Logs a new error (client-side or server-side).

**Input:**
```json
{
  "message": "TypeError: undefined is not an object",
  "stackTrace": "...",
  "severity": "high",
  "source": "client",
  "screen": "VehicleList",
  "appVersion": "1.1.3",
  "deviceInfo": "Samsung Galaxy S24"
}
```

**`monitoring.errors.resolve` (Mutation)** — Marks an error as resolved.

### 11.2 Bug Reports

**`monitoring.bugs.list` (Query)** — Lists all bug reports.

**`monitoring.bugs.create` (Mutation)** — Submits a new bug report.

**Input:**
```json
{
  "reporterName": "Elnur",
  "title": "App crashes on login",
  "description": "When I enter my PIN, the app closes.",
  "severity": "critical",
  "appVersion": "1.1.3"
}
```

**`monitoring.bugs.update` (Mutation)** — Updates bug report status or assignment.

### 11.3 System Health

**`monitoring.health.live` (Query)** — Returns current system health status.

**Output:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-29T12:00:00Z"
}
```

**`monitoring.health.summary` (Query)** — Returns aggregated system metrics including database statistics, user counts, and error counts.

---

## 12. Static File Endpoints

### 12.1 Car Model Images

**URL Pattern:** `http://91.107.161.67:3000/static/cars/{brand}/{model}.webp`

**Examples:**
- `http://91.107.161.67:3000/static/cars/toyota/camry.webp`
- `http://91.107.161.67:3000/static/cars/honda/civic.webp`
- `http://91.107.161.67:3000/static/cars/byd/atto-3.webp`

**Details:** 109 images total, 800px wide WebP format, 45–144 KB each. Brand names are lowercase, model names are lowercase with spaces replaced by hyphens.

### 12.2 Monitoring Dashboard

**URL:** `http://91.107.161.67:3000/monitoring`

**Access:** Restricted to admin IP whitelist. Provides an HTML dashboard for error triage, bug report management, and system health visualization.

---

## 13. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 25, 2026 | Initial API Reference |
| 2.0 | April 29, 2026 | Added brandsModels, pushTokens, users endpoints; added static file endpoints; updated auth phone format; added resetPin; corrected monitoring route names |
| 3.0 | June 10, 2026 | Added dwh.syncVehicles, vehicleRequests.create, pushTokens.delete; updated section numbering |

---

*This document is maintained in the Qaraj GM project repository and updated with each API version.*
