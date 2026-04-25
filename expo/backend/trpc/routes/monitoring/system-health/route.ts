/**
 * System Health Check Routes
 *
 * Provides endpoints for:
 * - Real-time system health status (DB, API, SMS)
 * - Historical health snapshots
 * - Dashboard summary with all key metrics
 */

import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { db } from '../../../../../db/index';
import {
  users,
  vehicles,
  appointments,
  errorLogs,
  bugReports,
  systemHealthSnapshots,
} from '../../../../../db/schema';
import { desc, eq, sql, gte, and } from 'drizzle-orm';

const startTime = Date.now();

/**
 * Live health check — tests DB connectivity and returns real-time status
 */
export const liveHealthProcedure = publicProcedure.query(async () => {
  const checks: Record<string, any> = {
    api: { status: 'healthy', responseTimeMs: 0 },
    database: { status: 'unknown', responseTimeMs: 0 },
    sms: { status: 'unknown' },
  };

  // Check database
  if (db) {
    const dbStart = Date.now();
    try {
      await db.select({ count: sql<number>`1` }).from(users).limit(1);
      checks.database = {
        status: 'healthy',
        responseTimeMs: Date.now() - dbStart,
      };
    } catch (err: any) {
      checks.database = {
        status: 'down',
        responseTimeMs: Date.now() - dbStart,
        error: err.message,
      };
    }
  } else {
    checks.database = { status: 'not_configured', responseTimeMs: 0 };
  }

  // Check SMS provider
  const smsProvider = process.env.SMS_PROVIDER || 'mock';
  if (smsProvider === 'softline') {
    checks.sms = {
      status: 'configured',
      provider: 'softline',
      sender: process.env.SMS_SENDER || 'unknown',
    };
  } else {
    checks.sms = { status: 'mock_mode', provider: 'mock' };
  }

  // API uptime
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const overallStatus =
    checks.database.status === 'down' ? 'degraded' :
    checks.database.status === 'not_configured' ? 'degraded' :
    'healthy';

  return {
    status: overallStatus,
    uptime: uptimeSeconds,
    uptimeFormatted: formatUptime(uptimeSeconds),
    nodeVersion: process.version,
    apiVersion: 'v1.0.3',
    timestamp: new Date().toISOString(),
    checks,
  };
});

/**
 * Dashboard summary — all key metrics in one call
 */
export const dashboardSummaryProcedure = publicProcedure.query(async () => {
  if (!db) return null;

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsersResult,
    totalVehiclesResult,
    totalAppointmentsResult,
    pendingAppointmentsResult,
    totalErrorsResult,
    unresolvedErrorsResult,
    errors24hResult,
    errorsBySeverityResult,
    errorsBySourceResult,
    openBugsResult,
    totalBugsResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(vehicles),
    db.select({ count: sql<number>`count(*)` }).from(appointments),
    db.select({ count: sql<number>`count(*)` }).from(appointments)
      .where(eq(appointments.status, 'pending')),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs)
      .where(eq(errorLogs.resolved, false)),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs)
      .where(gte(errorLogs.createdAt, last24h)),
    db.select({
      severity: errorLogs.severity,
      count: sql<number>`count(*)`,
    }).from(errorLogs)
      .where(eq(errorLogs.resolved, false))
      .groupBy(errorLogs.severity),
    db.select({
      source: errorLogs.source,
      count: sql<number>`count(*)`,
    }).from(errorLogs)
      .where(gte(errorLogs.createdAt, last7d))
      .groupBy(errorLogs.source),
    db.select({ count: sql<number>`count(*)` }).from(bugReports)
      .where(
        and(
          sql`${bugReports.status} != 'resolved'`,
          sql`${bugReports.status} != 'wont_fix'`
        )
      ),
    db.select({ count: sql<number>`count(*)` }).from(bugReports),
  ]);

  return {
    users: {
      total: Number(totalUsersResult[0]?.count || 0),
    },
    vehicles: {
      total: Number(totalVehiclesResult[0]?.count || 0),
    },
    appointments: {
      total: Number(totalAppointmentsResult[0]?.count || 0),
      pending: Number(pendingAppointmentsResult[0]?.count || 0),
    },
    errors: {
      total: Number(totalErrorsResult[0]?.count || 0),
      unresolved: Number(unresolvedErrorsResult[0]?.count || 0),
      last24h: Number(errors24hResult[0]?.count || 0),
      bySeverity: Object.fromEntries(
        errorsBySeverityResult.map((s) => [s.severity, Number(s.count)])
      ),
      bySource: Object.fromEntries(
        errorsBySourceResult.map((s) => [s.source, Number(s.count)])
      ),
    },
    bugs: {
      total: Number(totalBugsResult[0]?.count || 0),
      open: Number(openBugsResult[0]?.count || 0),
    },
    timestamp: now.toISOString(),
  };
});

/**
 * Save a health snapshot (called periodically by a cron job or manually)
 */
export const saveHealthSnapshotProcedure = publicProcedure.mutation(async () => {
  if (!db) return { success: false };

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Gather metrics
  const [
    totalUsersResult,
    totalVehiclesResult,
    totalAppointmentsResult,
    pendingResult,
    errorsTodayResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(vehicles),
    db.select({ count: sql<number>`count(*)` }).from(appointments),
    db.select({ count: sql<number>`count(*)` }).from(appointments)
      .where(eq(appointments.status, 'pending')),
    db.select({ count: sql<number>`count(*)` }).from(errorLogs)
      .where(gte(errorLogs.createdAt, todayStart)),
  ]);

  // Test DB response time
  const dbStart = Date.now();
  try {
    await db.select({ count: sql<number>`1` }).from(users).limit(1);
  } catch {}
  const dbResponseTimeMs = Date.now() - dbStart;

  const smsProvider = process.env.SMS_PROVIDER || 'mock';

  await db.insert(systemHealthSnapshots).values({
    apiStatus: 'healthy',
    dbStatus: dbResponseTimeMs < 5000 ? 'healthy' : 'degraded',
    smsStatus: smsProvider === 'softline' ? 'configured' : 'mock',
    apiResponseTimeMs: 0,
    dbResponseTimeMs,
    totalUsers: Number(totalUsersResult[0]?.count || 0),
    totalVehicles: Number(totalVehiclesResult[0]?.count || 0),
    totalAppointments: Number(totalAppointmentsResult[0]?.count || 0),
    pendingAppointments: Number(pendingResult[0]?.count || 0),
    errorCountToday: Number(errorsTodayResult[0]?.count || 0),
    uptimeSeconds,
    nodeVersion: process.version,
    apiVersion: 'v1.0.3',
  });

  return { success: true };
});

/**
 * Get historical health snapshots
 */
export const getHealthHistoryProcedure = publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(1000).default(100),
    }).optional()
  )
  .query(async ({ input }) => {
    if (!db) return { snapshots: [] };

    const snapshots = await db
      .select()
      .from(systemHealthSnapshots)
      .orderBy(desc(systemHealthSnapshots.createdAt))
      .limit(input?.limit || 100);

    return { snapshots };
  });

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}
