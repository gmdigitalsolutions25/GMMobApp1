const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * Enable package.json "exports" field resolution so that tRPC v11 subpath
 * imports (e.g. @trpc/server/unstable-core-do-not-import) resolve correctly.
 */
config.resolver = config.resolver || {};
config.resolver.unstable_enablePackageExports = true;

/**
 * Block server-side Node.js packages and unused native modules
 * from the client bundle. These packages use Node.js built-ins
 * (net, tls, crypto, fs) not available in React Native / Hermes on Android,
 * or require native plugins not configured in app.json.
 *
 * NOTE: @trpc/server is intentionally NOT blocked here because
 * @trpc/react-query imports from @trpc/server/unstable-core-do-not-import
 * which is a pure JS utility module safe for client-side use.
 * Only the server adapter entry points (adapters/*, http) use Node.js built-ins.
 */
config.resolver.blockList = [
  // Server-only packages (Node.js built-ins)
  /node_modules\/postgres\/.*/,
  /node_modules\/drizzle-orm\/.*/,
  /node_modules\/drizzle-kit\/.*/,
  /node_modules\/bcryptjs\/.*/,
  /node_modules\/hono\/.*/,
  /node_modules\/@hono\/.*/,
  // Block @trpc/server adapter entry points (use Node.js http, net, tls)
  /node_modules\/@trpc\/server\/dist\/adapters\/.*/,
  /node_modules\/@trpc\/server\/dist\/http\..*/,
  // Expo native modules NOT in app.json plugins — would crash native bridge
  /node_modules\/expo-notifications\/.*/,
  /node_modules\/expo-location\/.*/,
  /node_modules\/expo-device\/.*/,
  /node_modules\/expo-symbols\/.*/,
  // Block entire backend and db directories from client bundle
  /.*\/backend\/.*/,
  /.*\/db\/index\.ts/,
  /.*\/db\/schema\.ts/,
  /.*\/db\/seed\.ts/,
];

module.exports = config;
