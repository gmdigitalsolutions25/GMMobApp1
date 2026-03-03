/**
 * Standalone tRPC router type declaration for the mobile client.
 *
 * This file defines the AppRouter type WITHOUT importing any server-side code
 * (drizzle-orm, postgres, bcryptjs, etc.), preventing those Node.js-only
 * packages from being bundled into the React Native / Hermes JS engine.
 *
 * When the backend routes change, update the types here accordingly.
 */
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { CreateTRPCReact } from '@trpc/react-query';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface SparePart {
  name: string;
  partNumber: string;
  category: string;
  estimatedPrice: string;
  compatibility: string;
  notes: string;
}

export interface SparePartsResponse {
  parts: SparePart[];
  summary: string;
  maintenanceTips: string[];
}

export interface UserRecord {
  id: string;
  phone: string;
  username: string;
  email?: string;
  avatar?: string;
  language: string;
  theme: string;
  createdAt: string;
}

export interface VehicleRecord {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  color?: string;
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  userId: string;
  vehicleId?: string;
  serviceCenterId?: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface ServiceCenterRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  services: string[];
  hours: string;
  lat?: number;
  lng?: number;
}

// ── Router type (mirrors backend/trpc/app-router.ts without server imports) ───

import type { AnyTRPCRouter } from '@trpc/server';

// This is a type-only placeholder. The actual router is on the server.
// We use 'any' here to avoid importing server code into the client bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppRouter = any;
