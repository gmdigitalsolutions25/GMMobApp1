/**
 * Qaraj Database Relations — Drizzle ORM
 *
 * Defines relationships between tables so that Drizzle's relational
 * query API (db.query.*.findMany({ with: { ... } })) works correctly.
 *
 * Without these, any `with:` clause silently fails or throws at runtime.
 */

import { relations } from 'drizzle-orm';
import {
  users,
  vehicles,
  vehiclePhotos,
  appointments,
  serviceRecords,
  pushTokens,
} from './schema';

// ── Users Relations ─────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  appointments: many(appointments),
  pushTokens: many(pushTokens),
}));

// ── Vehicles Relations ──────────────────────────────────────────────────────

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  user: one(users, { fields: [vehicles.userId], references: [users.id] }),
  photos: many(vehiclePhotos),
}));

// ── Vehicle Photos Relations ────────────────────────────────────────────────

export const vehiclePhotosRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehiclePhotos.vehicleId],
    references: [vehicles.id],
  }),
}));

// ── Appointments Relations ──────────────────────────────────────────────────

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  vehicle: one(vehicles, {
    fields: [appointments.vehicleId],
    references: [vehicles.id],
  }),
}));

// ── Service Records Relations ───────────────────────────────────────────────

export const serviceRecordsRelations = relations(serviceRecords, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [serviceRecords.vehicleId],
    references: [vehicles.id],
  }),
}));

// ── Push Tokens Relations ───────────────────────────────────────────────────

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, { fields: [pushTokens.userId], references: [users.id] }),
}));
