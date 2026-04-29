import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users, vehicles, vehiclePhotos } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

const vehiclePhotoSchema = z.object({
  id: z.string(),
  uri: z.string(),
  isPrimary: z.boolean(),
});

export const createVehicleProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      brand: z.string().min(1).max(100),
      model: z.string().min(1).max(100),
      year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
      vin: z.string().optional().default(""),
      licensePlate: z.string().optional().default(""),
      photos: z.array(vehiclePhotoSchema).optional().default([]),
      primaryPhotoId: z.string().optional(),
      mileage: z.number().optional(),
      color: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured. Set DATABASE_URL to enable this feature.');
      // Find or auto-create user
      let user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ phone: input.phone, username: input.phone })
          .returning();
        user = newUser;
      }

      // Create vehicle
      const [vehicle] = await db
        .insert(vehicles)
        .values({
          userId: user.id,
          brand: input.brand,
          model: input.model,
          year: input.year,
          vin: input.vin ?? '',
          licensePlate: input.licensePlate ?? '',
          mileage: input.mileage,
          color: input.color,
          primaryPhotoId: input.primaryPhotoId ?? null,
        })
        .returning();

      // Insert photos
      if (input.photos.length > 0) {
        await db.insert(vehiclePhotos).values(
          input.photos.map((p) => ({
            vehicleId: vehicle.id,
            uri: p.uri,
            isPrimary: p.isPrimary,
          }))
        );
      }

      return {
        success: true,
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin ?? '',
          licensePlate: vehicle.licensePlate ?? '',
          mileage: vehicle.mileage ?? undefined,
          color: vehicle.color ?? undefined,
          createdAt: vehicle.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('[vehicles.create] DB error:', error);
      throw new Error('Failed to create vehicle. Please try again.');
    }
  });
