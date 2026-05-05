/**
 * vehicleRequests.create — Customer reports missing vehicle
 *
 * When a customer logs in and the DWH sync finds no vehicles,
 * they can tap "Find my vehicle" to notify the back-office.
 * This creates a record in vehicle_requests for follow-up.
 */

import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../../db";
import { vehicleRequests, users } from "../../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const createVehicleRequestProcedure = publicProcedure
  .input(
    z.object({
      phone: z.string().min(5).max(20),
      customerName: z.string().optional(),
      message: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (!db) {
        return { success: false, error: 'Database not configured' };
      }

      // Find the user
      const user = await db.query.users.findFirst({
        where: eq(users.phone, input.phone),
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Check if there's already a pending request from this user
      const existingRequest = await db.query.vehicleRequests.findFirst({
        where: and(
          eq(vehicleRequests.userId, user.id),
          eq(vehicleRequests.status, 'pending'),
        ),
      });

      if (existingRequest) {
        return {
          success: true,
          alreadyRequested: true,
          message: 'Request already submitted',
        };
      }

      // Create the request
      const [request] = await db.insert(vehicleRequests)
        .values({
          userId: user.id,
          phone: input.phone,
          customerName: input.customerName || user.firstName
            ? `${user.lastName || ''} ${user.firstName || ''}`.trim()
            : input.phone,
          message: input.message || null,
        })
        .returning();

      console.log(`[vehicleRequests.create] New request from ${input.phone} (${input.customerName || 'no name'})`);

      return {
        success: true,
        alreadyRequested: false,
        requestId: request.id,
      };
    } catch (error: any) {
      console.error('[vehicleRequests.create] Error:', error?.message || error);
      return { success: false, error: `Failed: ${error?.message || 'unknown'}` };
    }
  });
