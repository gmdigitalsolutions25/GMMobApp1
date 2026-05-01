/**
 * Error Monitoring Routes
 *
 * Provides endpoints for:
 * - Listing recent errors (with filters)
 * - Getting error statistics
 * - Marking errors as resolved
 */

import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { db } from '../../../../../db/index';
import { errorLogs } from '../../../../../db/schema';
import { desc, eq, sql, and, gte, lte } from 'drizzle-orm';

export const listErrorsProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(500).default(50),
      offset: z.number().min(0).default(0),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      resolved: z.boolean().optional(),
      source: z.string().optional(),
      fromDate: z.string().optional(),
      toDate: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    if (!db) return { errors: [], total: 0 };

    const filters = input || {};
    const conditions: any[] = [];

    if (filters.severity) {
      conditions.push(eq(errorLogs.severity, filters.severity));
    }
    if (filters.resolved !== undefined) {
      conditions.push(eq(errorLogs.resolved, filters.resolved));
    }
    if (filters.source) {
      conditions.push(eq(errorLogs.source, filters.source));
    }
    if (filters.fromDate) {
      conditions.push(gte(errorLogs.createdAt, new Date(filters.fromDate)));
    }
    if (filters.toDate) {
      conditions.push(lte(errorLogs.createdAt, new Date(filters.toDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [errors, countResult] = await Promise.all([
      db
        .select()
        .from(errorLogs)
        .where(whereClause)
        .orderBy(desc(errorLogs.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),
      db
        .select({ count: sql<number>`count(*)` })
        .from(errorLogs)
        .where(whereClause),
    ]);

    return {
      errors,
      total: Number(countResult[0]?.count || 0),
    };
  });

export const errorStatsProcedure = publicProcedure.query(async () => {
  if (!db) return null;

  const [total, unresolved, bySeverity, last24h] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(errorLogs),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs).where(eq(errorLogs.resolved, false)),
    db
      .select({
        severity: errorLogs.severity,
        count: sql<number>`count(*)`,
      })
      .from(errorLogs)
      .where(eq(errorLogs.resolved, false))
      .groupBy(errorLogs.severity),
    db
      .select({ count: sql<number>`count(*)` })
      .from(errorLogs)
      .where(gte(errorLogs.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))),
  ]);

  return {
    totalErrors: Number(total[0]?.count || 0),
    unresolvedErrors: Number(unresolved[0]?.count || 0),
    errorsLast24h: Number(last24h[0]?.count || 0),
    bySeverity: Object.fromEntries(
      bySeverity.map((s) => [s.severity, Number(s.count)])
    ),
  };
});

export const resolveErrorProcedure = publicProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      resolvedBy: z.string().min(1).max(100),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    if (!db) return { success: false };

    await db
      .update(errorLogs)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: input.resolvedBy,
        notes: input.notes,
      })
      .where(eq(errorLogs.id, input.id));

    return { success: true };
  });
