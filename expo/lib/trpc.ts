/**
 * tRPC client for Qaraj mobile app.
 *
 * IMPORTANT: This file must NOT import anything from @/backend/* or @/db/*
 * Those packages use Node.js built-ins (postgres, bcryptjs, drizzle-orm)
 * that are not available in the React Native / Hermes JS engine.
 *
 * The AppRouter type is imported from @/types/router which is a type-only
 * file with no server-side imports.
 */
import { createTRPCReact } from '@trpc/react-query';
import { httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/types/router';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  // Use environment variable if set (production deployment)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // Default to localhost for local development
  // The app works fully offline without a backend — API calls will fail
  // gracefully and the app will use local AsyncStorage state instead.
  return 'http://localhost:3000';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
