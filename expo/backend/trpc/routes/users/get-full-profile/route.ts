/**
 * users.getFullProfile — Fetch complete user profile by phone
 *
 * Returns: user profile, all vehicles (with photos), all appointments, all service records.
 * Called after successful auth (setPin / verifyPin) to hydrate the mobile app with server data.
 * This is the single source of truth — replaces AsyncStorage-only data loading.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, vehicles, vehiclePhotos, appointments, serviceRecords } from "../../../../../db/schema";
import { eq, desc } from "drizzle-orm";

export const getFullProfileProcedure = publicProcedure
  .input(z.object({ phone: z.string() }))
  .query(async ({ input }) => {
    try {
      if (!db) {
        return { user: null, vehicles: [], appointments: [], serviceRecords: [] };
      }

      // 1. Find user by phone
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { user: null, vehicles: [], appointments: [], serviceRecords: [] };
      }

      // 2. Fetch all vehicles with photos
      const userVehicles = await db.query.vehicles.findMany({
        where: eq(vehicles.userId, user.id),
        with: { photos: true },
        orderBy: (v, { desc }) => [desc(v.createdAt)],
      });

      const mappedVehicles = userVehicles.map((v) => ({
        id: v.id,
        userId: user.id,
        brand: v.brand,
        model: v.model,
        year: v.year,
        vin: v.vin ?? '',
        licensePlate: v.licensePlate ?? '',
        mileage: v.mileage ?? undefined,
        color: v.color ?? undefined,
        photos: (v as any).photos?.map((p: any) => p.uri) ?? [],
        primaryPhoto:
          (v as any).photos?.find((p: any) => p.isPrimary)?.uri ??
          (v as any).photos?.[0]?.uri ??
          undefined,
        createdAt: v.createdAt.toISOString(),
      }));

      // 3. Fetch all appointments
      const userAppointments = await db.query.appointments.findMany({
        where: eq(appointments.userId, user.id),
        orderBy: [desc(appointments.createdAt)],
      });

      const mappedAppointments = userAppointments.map((a) => ({
        id: a.id,
        vehicleId: a.vehicleId,
        serviceTypes: a.serviceTypes,
        serviceCenter: a.serviceCenter,
        serviceCenterAddress: a.serviceCenterAddress ?? undefined,
        date: a.date,
        time: a.time,
        status: a.status,
        notes: a.notes ?? undefined,
        createdAt: a.createdAt.toISOString(),
      }));

      // 4. Fetch all service records (across all vehicles)
      const vehicleIds = userVehicles.map((v) => v.id);
      let mappedServiceRecords: any[] = [];

      if (vehicleIds.length > 0) {
        // Fetch service records for all user's vehicles
        const allServiceRecords: any[] = [];
        for (const vid of vehicleIds) {
          const records = await db.query.serviceRecords.findMany({
            where: eq(serviceRecords.vehicleId, vid),
            orderBy: (r, { desc }) => [desc(r.createdAt)],
          });
          allServiceRecords.push(...records);
        }

        mappedServiceRecords = allServiceRecords.map((r) => ({
          id: r.id,
          vehicleId: r.vehicleId,
          serviceName: r.serviceName,
          serviceType: r.serviceType,
          date: r.date,
          mileage: r.mileage,
          notes: r.notes ?? undefined,
          cost: r.cost ?? undefined,
          serviceCenter: r.serviceCenter ?? undefined,
          technician: r.technician ?? undefined,
          partsUsed: r.partsUsed ?? [],
          createdAt: r.createdAt.toISOString(),
        }));
      }

      // 5. Return everything
      console.log(`[users.getFullProfile] Loaded profile for ${input.phone}: ${mappedVehicles.length} vehicles, ${mappedAppointments.length} appointments, ${mappedServiceRecords.length} service records`);

      return {
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          email: user.email ?? undefined,
          avatar: user.avatar ?? undefined,
          language: user.language,
          theme: user.theme,
          createdAt: user.createdAt.toISOString(),
        },
        vehicles: mappedVehicles,
        appointments: mappedAppointments,
        serviceRecords: mappedServiceRecords,
      };
    } catch (error) {
      console.error('[users.getFullProfile] DB error:', error);
      return { user: null, vehicles: [], appointments: [], serviceRecords: [] };
    }
  });
