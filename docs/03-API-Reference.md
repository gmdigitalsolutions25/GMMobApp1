# Qaraj GM — API Reference Document

**Version:** 1.0
**Date:** April 25, 2026
**Author:** Manus (AI CTO) for Group Motors / Qaraj GM
**Status:** Draft — Pre-Production

---

## 1. Overview

The Qaraj GM backend exposes a strictly typed tRPC API. All endpoints are accessible via HTTP POST (for mutations) or GET (for queries) at the base URL:

**Base URL:** `http://91.107.161.67:3000/api/trpc`

### 1.1 Authentication

All requests must include the API key in the headers:
- `x-api-key: qaraj-dev-key-2026`

Endpoints that require user authentication must also include a JWT token:
- `Authorization: Bearer <token>`

### 1.2 Rate Limiting

The API enforces rate limits per IP address:
- **OTP Endpoints:** 3 requests per minute
- **PIN Endpoints:** 10 requests per minute
- **AI Endpoints:** 5 requests per minute
- **Standard Endpoints:** 60 requests per minute

---

## 2. Authentication Endpoints (`auth.*`)

### 2.1 `auth.sendOtp` (Mutation)
Sends a 6-digit OTP via SMS to the provided phone number.

**Input:**
```json
{
  "phone": "+994501234567"
}
```

**Output:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "devCode": "123456" // Only present in mock mode
}
```

### 2.2 `auth.verifyOtp` (Mutation)
Verifies the OTP code.

**Input:**
```json
{
  "phone": "+994501234567",
  "code": "123456"
}
```

**Output:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "hasPin": false, // True if user already has a PIN set
  "userId": null   // UUID if user exists, null otherwise
}
```

### 2.3 `auth.setPin` (Mutation)
Sets a new PIN for a user (after OTP verification) and returns a JWT session token.

**Input:**
```json
{
  "phone": "+994501234567",
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
    "phone": "+994501234567",
    "username": "+994501234567",
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
  "phone": "+994501234567",
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

### 2.5 `auth.refreshToken` (Mutation)
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

## 3. Vehicle Endpoints (`vehicles.*`)

*Requires JWT Authentication*

### 3.1 `vehicles.list` (Query)
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
      "vin": "JT1...",
      "licensePlate": "99-AA-123",
      "color": "White",
      "mileage": 45000,
      "primaryPhotoUrl": "https..."
    }
  ]
}
```

### 3.2 `vehicles.add` (Mutation)
Registers a new vehicle.

**Input:**
```json
{
  "brand": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "JT1...",
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

### 3.3 `vehicles.update` (Mutation)
Updates an existing vehicle.

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

### 3.4 `vehicles.delete` (Mutation)
Deletes a vehicle and all associated records.

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

## 4. Appointment Endpoints (`appointments.*`)

*Requires JWT Authentication*

### 4.1 `appointments.list` (Query)
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

### 4.2 `appointments.book` (Mutation)
Books a new service appointment.

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

### 4.3 `appointments.cancel` (Mutation)
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

## 5. Service Center Endpoints (`serviceCenters.*`)

### 5.1 `serviceCenters.list` (Query)
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

## 6. AI Endpoints (`ai.*`)

### 6.1 `ai.sparePartsSearch` (Mutation)
Queries the OpenAI-powered spare parts advisor.

**Input:**
```json
{
  "query": "brake pads",
  "vehicleBrand": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2022,
  "vin": "JT1...",
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

## 7. Monitoring Endpoints (`monitoring.*`)

### 7.1 `monitoring.logClientError` (Mutation)
Logs a client-side error from the mobile app.

**Input:**
```json
{
  "message": "TypeError: undefined is not an object",
  "stackTrace": "...",
  "severity": "high",
  "screen": "VehicleList",
  "appVersion": "1.0.20",
  "deviceInfo": "Samsung Galaxy S24"
}
```

**Output:**
```json
{
  "success": true
}
```

### 7.2 `monitoring.submitBugReport` (Mutation)
Submits a bug report from a user or tester.

**Input:**
```json
{
  "reporterName": "Elnur",
  "title": "App crashes on login",
  "description": "When I enter my PIN, the app closes.",
  "severity": "critical",
  "appVersion": "1.0.20"
}
```

**Output:**
```json
{
  "success": true,
  "id": "uuid"
}
```

---

*This document is maintained in the Qaraj GM project repository and updated with each API version.*
