/**
 * tRPC client for Qaraj mobile app.
 *
 * IMPORTANT: This file must NOT import anything from @/backend/* or @/db/*
 * Those packages use Node.js built-ins (postgres, bcryptjs, drizzle-orm)
 * that are not available in the React Native / Hermes JS engine.
 *
 * The AppRouter type is imported from @/types/router which is a type-only
 * file with no server-side imports.
 *
 * Headers sent with every request:
 *   - x-api-key: API key for backend authentication
 *   - Authorization: Bearer <JWT> for user session (when available)
 */
import { createTRPCReact } from '@trpc/react-query';
import { httpLink } from '@trpc/client';
import superjson from 'superjson';
import * as SecureStore from 'expo-secure-store';
import type { AppRouter } from '@/types/router';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  // Use environment variable if set (production deployment)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // Default to localhost for local development
  return 'http://localhost:3000';
};

// API key for authenticating mobile app requests to the backend
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'qaraj-dev-key-2026';

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const headers: Record<string, string> = {
          'x-api-key': API_KEY,
        };

        // Attach JWT token if available
        try {
          const token = await SecureStore.getItemAsync('qaraj_jwt_token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch {
          // SecureStore not available (e.g., during SSR) — skip
        }

        return headers;
      },
    }),
  ],
});
