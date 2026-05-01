/**
 * Bug Report Routes
 *
 * Provides endpoints for:
 * - Submitting bug reports (from mobile app or team)
 * - Listing bug reports
 * - Updating bug report status
 * - Logging client-side errors from the mobile app
 */

import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { db } from '../../../../../db/index';
import { bugReports, errorLogs } from '../../../../../db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

export const submitBugReportProcedure = publicProcedure
  .input(
    z.object({
      reporterName: z.string().min(1).max(100),
      reporterPhone: z.string().optional(),
      reporterRole: z.enum(['user', 'tester', 'service_center', 'admin']).default('tester'),
      title: z.string().min(3).max(300),
      description: z.string().min(10).max(2000),
      stepsToReproduce: z.string().optional(),
      expectedBehavior: z.string().optional(),
      actualBehavior: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      deviceInfo: z.string().optional(),
      appVersion: z.string().optional(),
      screenshotUrls: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!db) return { success: false, id: null };

    const result = await db
      .insert(bugReports)
      .values({
        reporterName: input.reporterName,
        reporterPhone: input.reporterPhone,
        reporterRole: input.reporterRole,
        title: input.title,
        description: input.description,
        stepsToReproduce: input.stepsToReproduce,
        expectedBehavior: input.expectedBehavior,
        actualBehavior: input.actualBehavior,
        severity: input.severity,
        deviceInfo: input.deviceInfo,
        appVersion: input.appVersion,
        screenshotUrls: input.screenshotUrls || [],
      })
      .returning({ id: bugReports.id });

    return { success: true, id: result[0]?.id };
  });

export const listBugReportsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: z.enum(['new', 'acknowledged', 'in_progress', 'resolved', 'wont_fix']).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    if (!db) return { reports: [], total: 0 };

    const filters = input || {};
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(bugReports.status, filters.status));
    }
    if (filters.severity) {
      conditions.push(eq(bugReports.severity, filters.severity));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [reports, countResult] = await Promise.all([
      db
        .select()
        .from(bugReports)
        .where(whereClause)
        .orderBy(desc(bugReports.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(bugReports)
        .where(whereClause),
    ]);

    return {
      reports,
      total: Number(countResult[0]?.count || 0),
    };
  });

export const updateBugReportStatusProcedure = publicProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      status: z.enum(['new', 'acknowledged', 'in_progress', 'resolved', 'wont_fix']),
      assignedTo: z.string().optional(),
      resolution: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!db) return { success: false };

    const updates: any = {
      status: input.status,
      updatedAt: new Date(),
    };

    if (input.assignedTo) updates.assignedTo = input.assignedTo;
    if (input.resolution) updates.resolution = input.resolution;
    if (input.status === 'resolved') updates.resolvedAt = new Date();

    await db
      .update(bugReports)
      .set(updates)
      .where(eq(bugReports.id, input.id));

    return { success: true };
  });

/**
 * Client-side error logging — mobile app sends errors here.
 */
export const logClientErrorProcedure = publicProcedure
  .input(
    z.object({
      message: z.string().min(1).max(1000),
      stackTrace: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
      userId: z.string().uuid().optional(),
      userPhone: z.string().optional(),
      deviceInfo: z.string().optional(),
      appVersion: z.string().optional(),
      screen: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!db) return { success: false };

    await db.insert(errorLogs).values({
      severity: input.severity,
      source: 'mobile',
      endpoint: input.screen,
      message: input.message,
      stackTrace: input.stackTrace,
      userId: input.userId,
      userPhone: input.userPhone,
      deviceInfo: input.deviceInfo,
      appVersion: input.appVersion,
    });

    return { success: true };
  });
