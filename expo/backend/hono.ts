import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import {
  securityHeaders,
  restrictedCors,
  apiKeyAuth,
  rateLimiter,
  monitoringIpWhitelist,
  requestLogger,
} from "./middleware/security";

const app = new Hono();

// ── Global Middleware (applied to all routes) ─────────────────────────────────
app.use("*", securityHeaders);
app.use("*", restrictedCors);
app.use("*", requestLogger);

// ── Health Check (no auth, no rate limit) ─────────────────────────────────────
app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "Qaraj GM Backend API v1.0.2",
    monitoring: "/monitoring — Bug reports & error dashboard",
  });
});

// ── Monitoring Dashboard (IP whitelist only) ──────────────────────────────────
app.use("/monitoring*", monitoringIpWhitelist);

// ── tRPC API Routes (API key + rate limiting) ─────────────────────────────────
app.use("/api/trpc/*", rateLimiter);
app.use("/api/trpc/*", apiKeyAuth);
app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

export default app;
