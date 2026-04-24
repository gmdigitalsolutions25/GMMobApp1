/**
 * Qaraj GM Backend — Security Middleware
 *
 * Provides:
 * 1. API Key validation for mobile app requests
 * 2. IP-based rate limiting
 * 3. Monitoring dashboard IP whitelist
 * 4. Security headers
 * 5. Request logging
 */

import { Context, Next } from 'hono';

// ── Configuration ─────────────────────────────────────────────────────────────

const API_KEY = process.env.QARAJ_API_KEY || 'qaraj-dev-key-2026';

// Monitoring dashboard: only allow these IPs (add office/admin IPs)
const MONITORING_ALLOWED_IPS = (process.env.MONITORING_ALLOWED_IPS || '127.0.0.1,::1,::ffff:127.0.0.1').split(',').map(ip => ip.trim());

// CORS: allowed origins
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());

// ── Rate Limiter (in-memory, per-IP) ──────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore: Map<string, RateLimitEntry> = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints: strict limits to prevent brute force
  'auth.sendOtp':    { windowMs: 60_000,  maxRequests: 3 },   // 3 per minute
  'auth.verifyOtp':  { windowMs: 60_000,  maxRequests: 5 },   // 5 per minute
  'auth.verifyPin':  { windowMs: 60_000,  maxRequests: 10 },  // 10 per minute
  'auth.changePin':  { windowMs: 60_000,  maxRequests: 3 },   // 3 per minute

  // Data mutation endpoints: moderate limits
  'vehicles.create':           { windowMs: 60_000,  maxRequests: 10 },
  'vehicles.delete':           { windowMs: 60_000,  maxRequests: 10 },
  'appointments.create':       { windowMs: 60_000,  maxRequests: 10 },
  'appointments.updateStatus': { windowMs: 60_000,  maxRequests: 20 },
  'users.upsert':              { windowMs: 60_000,  maxRequests: 10 },

  // AI endpoint: expensive, limit tightly
  'ai.spareParts': { windowMs: 60_000, maxRequests: 5 },

  // Default for all other endpoints
  '_default': { windowMs: 60_000, maxRequests: 60 }, // 60 per minute
};

function checkRateLimit(ip: string, procedure: string): { allowed: boolean; retryAfterMs: number } {
  const config = RATE_LIMITS[procedure] || RATE_LIMITS['_default'];
  const key = `${ip}:${procedure}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// ── Helper: Extract client IP ─────────────────────────────────────────────────

function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    '127.0.0.1'
  );
}

// ── Helper: Extract tRPC procedure name from URL ──────────────────────────────

function extractProcedure(url: string): string {
  // tRPC URLs look like: /api/trpc/auth.sendOtp or /api/trpc/auth.sendOtp,auth.verifyOtp (batch)
  const match = url.match(/\/api\/trpc\/([^?]+)/);
  if (!match) return '_unknown';
  return match[1].split(',')[0]; // Take first procedure in batch
}

// ── Middleware: Security Headers ──────────────────────────────────────────────

export async function securityHeaders(c: Context, next: Next) {
  await next();

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Remove server identification
  c.header('X-Powered-By', '');
  c.header('Server', '');
}

// ── Middleware: CORS (restricted) ─────────────────────────────────────────────

export async function restrictedCors(c: Context, next: Next) {
  const origin = c.req.header('origin') || '';

  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin || '*');
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');
  c.header('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}

// ── Middleware: API Key Validation ─────────────────────────────────────────────

export async function apiKeyAuth(c: Context, next: Next) {
  const url = c.req.url;

  // Skip API key check for health check endpoint
  if (new URL(url).pathname === '/') {
    await next();
    return;
  }

  // Skip for monitoring (handled by IP whitelist separately)
  if (new URL(url).pathname.startsWith('/monitoring')) {
    await next();
    return;
  }

  const apiKey = c.req.header('x-api-key');

  if (!apiKey || apiKey !== API_KEY) {
    console.log(`[SECURITY] Rejected request - invalid API key from ${getClientIp(c)} to ${new URL(url).pathname}`);
    return c.json(
      {
        error: {
          message: 'Unauthorized: Invalid or missing API key',
          code: 'UNAUTHORIZED',
        },
      },
      401
    );
  }

  await next();
}

// ── Middleware: Rate Limiting ──────────────────────────────────────────────────

export async function rateLimiter(c: Context, next: Next) {
  const ip = getClientIp(c);
  const url = c.req.url;
  const procedure = extractProcedure(url);

  // Skip rate limiting for health check
  if (new URL(url).pathname === '/') {
    await next();
    return;
  }

  const { allowed, retryAfterMs } = checkRateLimit(ip, procedure);

  if (!allowed) {
    console.log(`[RATE-LIMIT] Blocked ${ip} on ${procedure} — retry after ${Math.ceil(retryAfterMs / 1000)}s`);
    c.header('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
    return c.json(
      {
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'TOO_MANY_REQUESTS',
        },
      },
      429
    );
  }

  await next();
}

// ── Middleware: Monitoring IP Whitelist ────────────────────────────────────────

export async function monitoringIpWhitelist(c: Context, next: Next) {
  const ip = getClientIp(c);

  // Normalize IPv6-mapped IPv4
  const normalizedIp = ip.replace('::ffff:', '');

  const isAllowed =
    MONITORING_ALLOWED_IPS.includes(ip) ||
    MONITORING_ALLOWED_IPS.includes(normalizedIp) ||
    MONITORING_ALLOWED_IPS.includes('*'); // Allow wildcard for dev

  if (!isAllowed) {
    console.log(`[SECURITY] Monitoring access denied for IP: ${ip}`);
    return c.text('403 Forbidden — Your IP is not authorized to access the monitoring dashboard.', 403);
  }

  await next();
}

// ── Middleware: Request Logger ─────────────────────────────────────────────────

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const ip = getClientIp(c);
  const method = c.req.method;
  const path = new URL(c.req.url).pathname;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Log all requests (skip health checks to reduce noise)
  if (path !== '/') {
    console.log(`[API] ${method} ${path} — ${status} — ${duration}ms — ${ip}`);
  }
}
