/**
 * users.updateOnboarding — Save onboarding profile data
 *
 * Called after user completes the onboarding flow.
 * Saves first_name, last_name, monthly_mileage, last_service_date, preferred_service_center.
 */
import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { users } from "../../../../../db/schema";
import { eq, sql } from "drizzle-orm";

export const updateOnboardingProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(7),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      monthlyMileage: z.number().optional(),
      lastServiceDate: z.string().optional(),
      preferredServiceCenter: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) throw new Error('Database not configured.');

      const [updated] = await db
        .update(users)
        .set({
          firstName: input.firstName.toLowerCase(),
          lastName: input.lastName.toLowerCase(),
          username: `${input.firstName} ${input.lastName}`,
          monthlyMileage: input.monthlyMileage ?? null,
          lastServiceDate: input.lastServiceDate ?? null,
          preferredServiceCenter: input.preferredServiceCenter ?? null,
          onboardingCompleted: true,
          updatedAt: sql`NOW()`,
        })
        .where(eq(users.phone, input.phone))
        .returning();

      if (!updated) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: updated.id,
          phone: updated.phone,
          username: updated.username,
          firstName: updated.firstName,
          lastName: updated.lastName,
          monthlyMileage: updated.monthlyMileage,
          lastServiceDate: updated.lastServiceDate,
          preferredServiceCenter: updated.preferredServiceCenter,
          onboardingCompleted: updated.onboardingCompleted,
        },
      };
    } catch (error) {
      console.error('[users.updateOnboarding] DB error:', error);
      throw new Error('Failed to save onboarding data. Please try again.');
    }
  });
