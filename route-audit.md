# Route Audit — design-v2 branch

## Available routes (files in app/):
- `/` (index.tsx)
- `/welcome` (welcome.tsx)
- `/auth` (auth.tsx)
- `/pin-login` (pin-login.tsx)
- `/onboarding` (onboarding.tsx)
- `/(tabs)/home` (tabs/home.tsx)
- `/(tabs)/vehicles` (tabs/vehicles.tsx)
- `/(tabs)/appointments` (tabs/appointments.tsx)
- `/(tabs)/profile` (tabs/profile.tsx)
- `/add-vehicle` (add-vehicle.tsx)
- `/edit-vehicle` (edit-vehicle.tsx)
- `/vehicle-photo` (vehicle-photo.tsx)
- `/notifications` (notifications.tsx)
- `/service-details` (service-details.tsx)
- `/health-detail` (health-detail.tsx) — NEW

## V1 broken links found:

### app/(tabs)/home.tsx (v1 HomeScreen)
- Line 488: `router.push('/vehicles')` — BROKEN, should be `/(tabs)/vehicles`
- Line 492: `router.push('/service-details?id=...')` — OK (standalone route)

### app/(tabs)/vehicles.tsx (v1 VehiclesScreen)
- Line 199: `router.push('/add-vehicle')` — OK
- Line 275: `router.push('/edit-vehicle?vehicleId=...')` — OK
- Line 286: `router.push('/vehicle-photo?vehicleId=...')` — OK
- Line 366, 478: `router.push({...})` — need to check params

## V2 — all routes verified OK in previous commit

## Auth flow routes — all OK:
- welcome → /auth ✓
- auth → /onboarding or /(tabs)/home ✓
- pin-login → /(tabs)/home or /auth ✓
- onboarding → /(tabs)/home ✓
- _layout → all correct ✓

## ISSUES TO FIX:
1. V1 home.tsx line 488: `/vehicles` → `/(tabs)/vehicles`
