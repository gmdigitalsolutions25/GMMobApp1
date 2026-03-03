import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { vehicleStore, userStore } from "@/backend/store";

const vehiclePhotoSchema = z.object({
  id: z.string(),
  uri: z.string(),
  isPrimary: z.boolean(),
});

export const createVehicleProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string(),
      brand: z.string().min(1),
      model: z.string().min(1),
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
    // Ensure user exists (auto-create if not)
    let user = userStore.getByPhone(input.phone);
    if (!user) {
      user = userStore.upsert({
        phone: input.phone,
        username: input.phone,
        language: "en",
        theme: "dark",
      });
    }

    const vehicle = vehicleStore.create({
      userId: user.id,
      brand: input.brand,
      model: input.model,
      year: input.year,
      vin: input.vin,
      licensePlate: input.licensePlate,
      photos: input.photos,
      primaryPhotoId: input.primaryPhotoId,
      mileage: input.mileage,
      color: input.color,
    });

    return { success: true, vehicle };
  });
